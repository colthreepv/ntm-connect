import antfu from '@antfu/eslint-config'

export default antfu({
  // Extend Next.js core web vitals rules
  extends: ['next/core-web-vitals'],
  react: true,

  // Add any custom rules or overrides
  rules: {
    'node/prefer-global/process': 'off',
  },
})
