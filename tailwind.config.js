/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        'ultra': '810px',
      }
    }
  },
  corePlugins: {
    preflight: true,
  }
}