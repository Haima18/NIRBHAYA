/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // The product already ships a complete, accessible CSS foundation. Preflight
  // would reset its headings, buttons, and form controls, so only the utility
  // layer is generated here.
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {}
  },
  plugins: []
};
