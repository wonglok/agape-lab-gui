module.exports = {
  mode: 'jit',
  content: [
    //
    './src/**/*.{js,jsx}',
  ], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
