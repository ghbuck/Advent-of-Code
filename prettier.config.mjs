export default {
  semi: false,
  singleQuote: true,
  printWidth: 150,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^@utils/(.*)$', '^@.+$', '^[./]', '^.+$'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
