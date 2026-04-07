/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'taxi-yellow': '#FFD600',
        'taxi-black': '#1a1a1a',
        'taxi-dark': '#2d2d2d',
        'taxi-gray': '#f5f5f5'
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}