/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Base grays
        'base-gray': {
          0: 'var(--base-gray-0)',
          100: 'var(--base-gray-100)',
          200: 'var(--base-gray-200)',
          300: 'var(--base-gray-300)',
          400: 'var(--base-gray-400)',
        },
        white: 'var(--base-white)',
        // Brand colors
        'brand-blue': {
          100: 'var(--brand-blue-100)',
          200: 'var(--brand-blue-200)',
          300: 'var(--brand-blue-300)',
        },
        'brand-green': 'var(--brand-green)',
        'brand-red': 'var(--brand-red)',
      },
      fontFamily: {
        condensed: ['Roboto Condensed', 'sans-serif'],
      },
      screens: {
        'sm': '375px',
        'md': '768px',
        'lg': '1024px',
      },
      typography: {
        'headline-1': {
          css: {
            fontFamily: 'var(--font-family-condensed)',
            fontWeight: '700',
            fontSize: '56px',
          },
        },
        'headline-2': {
          css: {
            fontFamily: 'var(--font-family-condensed)',
            fontWeight: '700',
            fontSize: '36px',
          },
        },
        'headline-3': {
          css: {
            fontFamily: 'var(--font-family-condensed)',
            fontWeight: '700',
            fontSize: '24px',
          },
        },
        'headline-4': {
          css: {
            fontFamily: 'var(--font-family-condensed)',
            fontWeight: '700',
            fontSize: '20px',
          },
        },
        'body-1-regular': {
          css: {
            fontFamily: 'var(--font-family-condensed)',
            fontWeight: '400',
            fontSize: '16px',
          },
        },
        'body-1-medium': {
          css: {
            fontFamily: 'var(--font-family-condensed)',
            fontWeight: '700',
            fontSize: '16px',
          },
        },
        'body-2-regular': {
          css: {
            fontFamily: 'var(--font-family-condensed)',
            fontWeight: '400',
            fontSize: '14px',
          },
        },
        'body-2-medium': {
          css: {
            fontFamily: 'var(--font-family-condensed)',
            fontWeight: '500',
            fontSize: '14px',
          },
        },
        'body-3': {
          css: {
            fontFamily: 'var(--font-family-condensed)',
            fontWeight: '400',
            fontSize: '12px',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}