/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#579BB1",
        secondary: "#E1D7C6",
        accent: "#ECE8DD",
        background: "#F8F4EA",
        primary_dark: "#579BB1",
        secondary_dark: "#2E535E",
        accent_dark: "#273f4e",
        background_dark: "#142129",
      },
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"],
        robotoCondensed: ["Roboto Condensed", "sans-serif"],
      },
    },
  },
  plugins: [],
};
