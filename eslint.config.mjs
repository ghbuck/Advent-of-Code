// @ts-check
import eslint from '@eslint/js'

import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

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
    ignores: [
      'eslint.config.mjs',
      'lint-staged.config.mjs',
      'jest.config.mjs',
      'prettier.config.mjs',
      'src/tests/playground.ts',
      'src/utils/template/index.ts',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  eslintConfigPrettier,
)
