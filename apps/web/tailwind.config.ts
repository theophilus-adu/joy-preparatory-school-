import type { Config } from 'tailwindcss'

// Joy Prep school colours: black and yellow.
const ink = {
  50: '#f7f7f4',
  100: '#efefea',
  200: '#e0dfd8',
  300: '#c4c3b9',
  400: '#99978c',
  500: '#717067',
  600: '#55544d',
  700: '#3b3a35',
  800: '#262522',
  900: '#171614',
  950: '#0c0b0a',
}

const gold = {
  50: '#fffbeb',
  100: '#fff4c2',
  200: '#ffe98a',
  300: '#ffdc4d',
  400: '#ffcf1f',
  500: '#f5bc00',
  600: '#cc9900',
  700: '#9e7400',
  800: '#735400',
  900: '#4a3600',
  950: '#2b1f00',
}

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm neutrals replace Tailwind's cool slate so greys sit well next to yellow.
        slate: ink,
        ink,
        gold,
        brand: ink,
        accent: gold,
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(12, 11, 10, 0.04), 0 2px 8px -2px rgba(12, 11, 10, 0.06)',
        lift: '0 8px 24px -8px rgba(12, 11, 10, 0.18)',
        glow: '0 0 0 4px rgba(255, 207, 31, 0.25)',
      },
      backgroundImage: {
        // Diagonal hazard-style stripes used as a decorative school motif
        stripes: 'repeating-linear-gradient(135deg, var(--tw-gradient-from) 0 14px, transparent 14px 28px)',
        dots: 'radial-gradient(rgba(255,207,31,0.18) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
export default config
