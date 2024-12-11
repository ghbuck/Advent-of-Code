// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from "eslint-config-prettier"


export default tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['eslint.config.mjs', 'prettier.config.mjs', 'lint-staged.config.mjs', 'src/utils/template/index.ts']
  },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  eslintConfigPrettier,
)
