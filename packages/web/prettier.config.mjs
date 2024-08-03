/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  // You can add other Prettier options here
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
}

export default config
