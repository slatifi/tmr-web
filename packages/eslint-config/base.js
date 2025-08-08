import js from '@eslint/js';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';

export function baseConfig({ isWeb = false, svelteConfig } = {}) {
    const config = [
        js.configs.recommended,
        ...ts.configs.recommended,
        prettier,
        eslintPluginPrettierRecommended,
        {
            languageOptions: {
                globals: { ...globals.browser, ...globals.node, ...globals.jest, ...globals.vitest },
                sourceType: isWeb ? 'module' : 'commonjs',
                parserOptions: {
                    projectService: !isWeb,
                    tsconfigRootDir: import.meta.dirname,
                }
            },
            rules: isWeb ? {} : {
                'no-undef': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-floating-promises': 'warn',
                '@typescript-eslint/no-unsafe-argument': 'warn'
            }
        },
    ];

    if (isWeb && svelteConfig) {
        config.push(
            ...svelte.configs.recommended,
            ...svelte.configs.prettier,
            {
                files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
                languageOptions: {
                    parserOptions: {
                        extraFileExtensions: ['.svelte'],
                        projectService: true,
                        parser: ts.parser,
                        svelteConfig
                    }
                }
            },
            {
                ignores: ['**/.svelte-kit']
            }
        );
    };

    return config;
};
