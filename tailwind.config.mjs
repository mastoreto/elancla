import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF2E34',
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
        'primary-dark': '#D91A23',
        'background-light': '#FAF8F5',
        'background-dark': '#1a1a1a',
        'surface-light': '#ffffff',
        'surface-dark': '#2a2a2a',
        'neutral-850': '#1f1f1f',
        'paper-light': '#FFFFFF',
        'paper-dark': '#1E1E1E',
      },
      fontFamily: {
        display: ["'Newsreader'", 'serif'],
        sans: ["'Noto Sans'", 'sans-serif'],
        body: ["'Merriweather'", 'serif'],
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
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        card: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            fontFamily: theme('fontFamily.body'),
            h2: {
              fontFamily: theme('fontFamily.display'),
              color: theme('colors.gray.900'),
            },
            h3: {
              fontFamily: theme('fontFamily.display'),
              color: theme('colors.gray.900'),
            },
            strong: {
              color: theme('colors.gray.900'),
            },
            blockquote: {
              fontFamily: theme('fontFamily.display'),
              color: theme('colors.primary.DEFAULT'),
              borderLeftColor: theme('colors.primary.DEFAULT'),
              fontStyle: 'italic',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            h2: {
              color: theme('colors.white'),
            },
            h3: {
              color: theme('colors.white'),
            },
            strong: {
              color: theme('colors.white'),
            },
          },
        },
      }),
    },
  },
  plugins: [typography, forms],
};
