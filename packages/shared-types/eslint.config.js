import { eslintBaseConfig } from '@repo/eslint-config';
import ts from 'typescript-eslint';

export default ts.config(...eslintBaseConfig({ isWeb: false }), {
	ignores: ['eslint.config.js', '.prettierrc.js', '**/dist/**']
});
