/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#000000',
          900: '#121212',
          800: '#1E1E1E',
          700: '#2C2C2C',
          600: '#3A3A3A',
          500: '#4A4A4A',
          400: '#6C6C6C',
          300: '#8C8C8C',
          200: '#B0B0B0',
          100: '#D1D1D1',
          50: '#E9E9E9',
          transparent: 'rgba(0, 0, 0, 0.05)',
        },
        white: {
          DEFAULT: '#FFFFFF',
          900: '#F9F9F9',
          800: '#F0F0F0',
          700: '#E5E5E5',
          600: '#CCCCCC',
          500: '#B3B3B3',
          400: '#999999',
          300: '#7F7F7F',
          200: '#666666',
          100: '#4C4C4C',
          50: '#333333',
          transparent: 'rgba(255, 255, 255, 0.05)',
        },
        gray: {
          50: '#F9F9F9',
          100: '#F4F4F4',
          200: '#E1E1E1',
          300: '#CFCFCF',
          400: '#B1B1B1',
          500: '#9E9E9E',
          600: '#7E7E7E',
          700: '#626262',
          800: '#515151',
          900: '#3B3B3B',
        },
      },
      borderColor: {
        DEFAULT: '#000', // black borders by default
      },
    },
    fontFamily: {
      sans: ['system-ui', 'sans-serif'],
      mono: ['ui-monospace', 'monospace'],
    },
  },
  plugins: [],
};
