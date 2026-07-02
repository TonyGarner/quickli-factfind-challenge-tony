/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        quickli: {
          primary: '#0F172A',      // Deep slate/navy - trust
          accent: '#0284C7',       // Sky blue - modern fintech
          success: '#059669',      // Emerald
          warning: '#D97706',
          danger: '#DC2626',
          light: '#F1F5F9',
          muted: '#64748B',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
