/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0a0a0a',
        'cyber-green': '#00ff41',
        'cyber-red': '#ff003c',
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'], // Hacker font
      }
    },
  },
  plugins: [],
}