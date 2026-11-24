/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#f2f2f7',
          card: '#ffffff',
          sep: '#e5e5ea',
          label: '#1c1c1e',
          secondary: '#8e8e93',
          blue: '#007aff',
          green: '#34c759',
          red: '#ff3b30',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        ios: '0.875rem',
      },
    },
  },
  plugins: [],
};
