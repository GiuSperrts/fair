/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: 'var(--apple-blue)',
          gray: 'var(--apple-gray)',
          'light-gray': 'var(--apple-light-gray)',
          'dark-gray': 'var(--apple-dark-gray)',
          red: 'var(--apple-red)',
          green: 'var(--apple-green)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}