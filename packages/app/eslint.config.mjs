import antfu from '@antfu/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default antfu({
  typescript: true, // Enable TypeScript support
  jsx: true, // Enable JSX support
  ignores: ['dist'], // Ignore the 'dist' directory
  stylistic: true, // Enable stylistic rules
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
      },
      rules: {
        ...reactHooks.configs.recommended.rules, // Include React Hooks rules
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
        'no-console': 'warn', // Custom rule from @antfu
      },
    },
  ],
})
