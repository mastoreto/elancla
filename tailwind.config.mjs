/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ffeff0',
          100: '#ffdcdf',
          200: '#ffbfc5',
          300: '#ff929c',
          400: '#ff5463',
          500: '#ff1f33',
          600: '#ff0016',
          700: '#db0013',
          800: '#b70010',
          900: '#940814',
          950: '#520007',
        },
        secondary: {
          50: '#f8f7f4',
          100: '#f3f1ec',
          200: '#ddd8cb',
          300: '#c8bda9',
          400: '#b19f86',
          500: '#a18a6e',
          600: '#947a62',
          700: '#7c6452',
          800: '#655247',
          900: '#53443b',
          950: '#2c231e',
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        barastika: ['Barastika', 'sans-serif'],
        'futura-bold': ['FuturaNo2D', 'open-type'],
        futura: ['Futura No2 D OT Medium', 'open-type'],
        'boston-angel': ['Boston Angel', 'sans-serif'],
        'boston-angel-bold': ['Boston Angel Bold', 'sans-serif'],
      },
      backgroundImage: {
        'home-banner': "url('/images/homebanner.jpeg')",
        aboutus: "url('/images/aboutus.jpg')",
      },
    },
  },
  plugins: [],
};
