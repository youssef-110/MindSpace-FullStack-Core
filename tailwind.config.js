/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- MAKE SURE THIS LINE IS HERE
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};