/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
        },
        primary: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2',
        },
        secondary: '#8b5cf6',
        accent: '#14b8a6',
      },
    },
  },
  plugins: [],
}
