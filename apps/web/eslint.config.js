import { eslintBaseConfig } from '@repo/eslint-config';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(...eslintBaseConfig({ isWeb: true, svelteConfig }));
