import antfu from '@antfu/eslint-config'
import prettier from 'eslint-config-prettier'

export default antfu({
  // Extend Next.js core web vitals rules
  extends: ['next/core-web-vitals'],
  react: true,

  // Add any custom rules or overrides
  rules: {
    'node/prefer-global/process': 'off',
  },
}, prettier)
