package main

import (
	"database/sql"
	"encoding/csv"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// This script is inspired by the transitiveClosureRf2SnapMulti.pl script in the IHTSDO/snomed-database-loader repo
// Adapated to write to SQLite instead of MySQL and not require a Full release

const (
	isaTypeId  = "116680003"
	snomedRoot = "138875005"
)

type Snomed2DArray map[string]map[string]bool

func findRelationshipFiles(releaseDir string) ([]string, error) {
	pattern := filepath.Join(releaseDir, "Snapshot", "Terminology", "sct2_Relationship_*Snapshot_*.txt")
	matches, err := filepath.Glob(pattern)
	if err != nil {
		return nil, fmt.Errorf("error finding relationship files: %v", err)
	}
	if len(matches) == 0 {
		return nil, fmt.Errorf("no relationship files found in %s", releaseDir)
	}
	return matches, nil
}

func parseRelationshipFile(files []string) (Snomed2DArray, error) {
	// columns
	// id - effectiveTime - active - moduleId - sourceId - destinationId - relationshipGroup - typeId - characteristicTypeId - modifierId
	children := make(Snomed2DArray)

	for _, path := range files {
		file, err := os.Open(path)
		if err != nil {
			return nil, fmt.Errorf("error opening file %s: %v", path, err)
		}
		defer file.Close()

		reader := csv.NewReader(file)
		reader.Comma = '\t'
		reader.LazyQuotes = true
		reader.ReuseRecord = true

		if _, err := reader.Read(); err != nil {
			return nil, fmt.Errorf("error reading header from file %s: %v", path, err)
		}

		for {
			record, err := reader.Read()
			if err == io.EOF {
				break
			}
			if err != nil {
				return nil, fmt.Errorf("error reading record from file %s: %v", path, err)
			}

			if len(record) < 10 {
				continue
			}

			if record[2] != "1" || record[7] != isaTypeId {
				continue
			}

			childId, parentId := record[4], record[5]
			if _, exists := children[parentId]; !exists {
				children[parentId] = make(map[string]bool)
			}
			children[parentId][childId] = true
		}
	}
	return children, nil
}

// Like the IHTSDO version, this is based on the DAG_DFTC algorithm by Yannis Ioannidis, Raghu Ramakrishnan, and Linda Winger
// https://doi.org/10.1145/155271.155273
func computeTransitiveClosure(root string, children Snomed2DArray) Snomed2DArray {
	descendants := make(Snomed2DArray)
	visited := make(map[string]bool)

	type frame struct {
		node      string
		processed bool
	}

	stack := []frame{{node: root, processed: false}}

	for len(stack) > 0 {
		top := &stack[len(stack)-1]

		if top.processed {
			stack = stack[:len(stack)-1]
			node := top.node

			for child := range children[node] {
				if _, exists := descendants[node]; !exists {
					descendants[node] = make(map[string]bool)
				}

				for desc := range descendants[child] {
					descendants[node][desc] = true
				}
				descendants[node][child] = true
			}
		} else {
			top.processed = true
			for child := range children[top.node] {
				if !visited[child] {
					visited[child] = true
					stack = append(stack, frame{node: child, processed: false})
				}
			}
		}
	}

	return descendants
}

func writeToDb(dbPath string, descendants Snomed2DArray) error {
	os.Remove(dbPath)

	db, err := sql.Open("sqlite3", dbPath+"?journal_mode=WAL")
	if err != nil {
		return fmt.Errorf("error opening database: %v", err)
	}
	defer db.Close()

	createTable := `
	PRAGMA synchronous = OFF;

	CREATE TABLE transitive_closure (
		child TEXT NOT NULL,
		ancestor TEXT NOT NULL,
		PRIMARY KEY (child, ancestor)
	);

	CREATE INDEX idx_ancestor ON transitive_closure (ancestor);
	CREATE INDEX idx_child ON transitive_closure (child);
	`

	_, err = db.Exec(createTable)

	if err != nil {
		return fmt.Errorf("error creating schema: %v", err)
	}

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}

	stmt, err := tx.Prepare("INSERT INTO transitive_closure (child, ancestor) VALUES (?, ?)")
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error preparing statement: %v", err)
	}
	defer stmt.Close()

	total := 0
	for ancestor, children := range descendants {
		for child := range children {
			if _, err := stmt.Exec(child, ancestor); err != nil {
				tx.Rollback()
				return fmt.Errorf("error inserting record (child: %s, ancestor: %s): %v", child, ancestor, err)
			}
			total++
			if total%500000 == 0 {
				log.Printf("Inserted %d records...", total)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	log.Printf("Finished inserting %d records into the database", total)
	return nil
}

func processRelease(releaseDir, dbPath string, extraFiles []string) error {
	log.Printf("Finding relationship files in release directory: %s", releaseDir)
	files, err := findRelationshipFiles(releaseDir)
	if err != nil {
		return err
	}
	files = append(files, extraFiles...)
	log.Printf("Found %d relationship files to process", len(files))

	log.Println("Parsing relationship files...")
	children, err := parseRelationshipFile(files)
	if err != nil {
		return err
	}
	log.Printf("Parsed relationships for %d parent concepts", len(children))

	log.Println("Computing transitive closure...")
	descendants := computeTransitiveClosure(snomedRoot, children)
	log.Printf("Computed transitive closure for %d ancestor concepts", len(descendants))

	log.Println("Writing results to database...")
	if err := writeToDb(dbPath, descendants); err != nil {
		return err
	}
	log.Println("Finished writing to database")
	return nil
}

func main() {
	release := flag.String("release", "", "Path to the SNOMED CT release folder")
	dbPath := flag.String("db", "snomed.db", "Path to the output SQLite database")
	extraFilePaths := flag.String("extraFiles", "", "(Optional) Comma-separated list of additional Relationship Snapshot files")

	if len(os.Args) < 2 {
		fmt.Println("usage: go run main.go -release <path_to_release_folder> [-db <path_to_output_db>] [-extraFiles <comma_separated_list_of_extra_files>]")
		os.Exit(1)
	}

	flag.Parse()

	if *release == "" {
		log.Fatal("error: -release flag is required")
	}

	var extraFiles []string
	if *extraFilePaths != "" {
		for _, file := range filepath.SplitList(*extraFilePaths) {
			extraFiles = append(extraFiles, file)
		}
	}
	if err := processRelease(*release, *dbPath, extraFiles); err != nil {
		log.Fatalf("error processing release: %v", err)
	}
}
