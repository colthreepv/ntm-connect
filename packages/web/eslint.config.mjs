import antfu from '@antfu/eslint-config'
import prettier from 'eslint-config-prettier'
import nextPlugin from '@next/eslint-plugin-next'

export default antfu(
  {
    react: true,

    plugins: {
      '@next/next': nextPlugin,
    },

    rules: {
      'node/prefer-global/process': 'off',

      // Add recommended Next.js rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
      '@next/next/no-unwanted-polyfillio': 'error',
      '@next/next/no-page-custom-font': 'error',
    },
  },

  prettier,
)
