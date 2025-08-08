export function prettierBaseConfig({ svelte = false } = {}) {
    const config = {
        useTabs: true,
        singleQuote: true,
        semi: true,
        trailingComma: 'none',
        printWidth: 100,
        overrides: [],
        plugins: []
    };

    if (svelte) {
        config.plugins.push('prettier-plugin-svelte', 'prettier-plugin-tailwindcss');
        config.overrides.push({
            files: '*.svelte',
            options: {
                parser: 'svelte'
            }
        });
        config.tailwindStylesheet = './src/app.css';
    }

    return config;
}
