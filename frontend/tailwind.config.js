/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#f7f7f8',
        accent: {
          DEFAULT: '#b0bafb',
          hover: '#9ba7f9',
          light: '#e6e9fe',
        },
        positive: {
          DEFAULT: '#4ade80',
          light: '#dcfce7',
        },
        alert: {
          DEFAULT: '#f87171',
          light: '#fee2e2',
        },
        warning: {
          DEFAULT: '#fbbf24',
          light: '#fef3c7',
        },
        brand: {
          DEFAULT: '#b0bafb',
          hover: '#8b98f8',
          bg: '#f8f8fa',
          text: '#1e1e2e',
          muted: '#6b7280',
          success: '#86efac',
          danger: '#fca5a5'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}

// For Landing Page :

