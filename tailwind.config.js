import withMT from "@material-tailwind/react/utils/withMT";

/** @type {import('tailwindcss').Config} */
export default withMT({
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#123F6D',
          50: '#e8f0f7',
          100: '#c5d9ea',
          200: '#9ebfdc',
          300: '#77a5ce',
          400: '#5991c3',
          500: '#3b7db8',
          600: '#3570aa',
          700: '#2d6098',
          800: '#255086',
          900: '#123F6D',
        },
        // Alias para facilitar uso
        'primary-default': '#123F6D',
        accent: {
          DEFAULT: '#ED145B',
          50: '#fde4ec',
          100: '#fbbcd0',
          200: '#f890b1',
          300: '#f56492',
          400: '#f2437a',
          500: '#f02262',
          600: '#df1e5a',
          700: '#cb1a50',
          800: '#b71646',
          900: '#ED145B',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#818385',
          600: '#6b7280',
          700: '#4b5563',
          800: '#374151',
          900: '#1f2937',
        },
      },
    },
  },
  plugins: [],
})

