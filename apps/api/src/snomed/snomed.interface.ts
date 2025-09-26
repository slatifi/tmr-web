// An enum that mirrors the responses from the FHIR terminology server for SNOMED CT subsumption testing
export enum SNOMEDSubsumes {
	SUBSUMES = 'subsumes',
	SUMSUMED_BY = 'subsumed-by',
	EQUIVALENT = 'equivalent',
	NONE = 'not-subsumed'
}
