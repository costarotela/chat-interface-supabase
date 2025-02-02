module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#0F172A',
        'medium-blue': '#1E293B',
        'accent-blue': '#38BDF8',
        'dark-gray': '#334155'
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
