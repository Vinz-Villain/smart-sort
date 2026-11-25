/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        syne: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glass': '0 10px 40px -10px rgba(0, 0, 0, 0.05), 0 0 20px -5px rgba(16, 185, 129, 0.08)',
        'glass-hover': '0 20px 40px -10px rgba(5, 150, 105, 0.14), 0 0 30px -5px rgba(20, 184, 166, 0.12)',
        'glow-teal': '0 0 30px -5px rgba(20, 184, 166, 0.4)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 30px -5px rgba(245, 158, 11, 0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer-slide': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        'float-slow': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer-slide 3s infinite',
      }
    },
  },
  plugins: [],
}

