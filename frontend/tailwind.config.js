// tailwind.config.js
export const content = [
  "./index.html",
  "./src/**/*.{js,jsx,ts,tsx}",
];

export const darkMode = 'class';

export const theme = {
  extend: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui'],
    },
    colors: {
      black: '#000000',
      white: '#FFFFFF',
      gray: {
        100: '#F7F7F7',
        200: '#EEEEEE',
        300: '#CCCCCC',
        400: '#AAAAAA',
        500: '#777777',
        600: '#555555',
        700: '#333333',
        800: '#222222',
        900: '#111111',
      },
    },
  },
};

export const plugins = [];
