import eslint from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

// ESLint 9 flat config. El formateo lo maneja Biome; ESLint sólo lintea.
export default tseslint.config(
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'public/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // `any` en el frontmatter de .astro: lo dejamos como aviso, no error.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Astro genera env.d.ts con triple-slash references (patrón oficial).
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  }
);
