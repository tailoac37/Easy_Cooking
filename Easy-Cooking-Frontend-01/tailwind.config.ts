/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1280px',
      '2xl': '1280px',
    },
    
    extend: {
      colors: {
        main: '#003459',
        dark: '#00171F',
        light: '#667479',
      },
    },
  },
  plugins: [],
};
