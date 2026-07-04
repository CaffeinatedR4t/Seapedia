/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#1B2430', 700: '#2E3A4A', 500: '#5C6B7A' },
        paper: { 50: '#FBF7F1', 100: '#F3ECE1', 200: '#E8DDCC' },
        coral: { 100: '#FBE2D4', 600: '#D9633B', 700: '#B84E2C' },
        gold: { 500: '#D9A441' },
        status: {
          packing: '#D9A441',
          waiting: '#4C7A92',
          shipping: '#D9633B',
          done: '#4A7C59',
          returned: '#A3443A',
        },
        success: '#4A7C59',
        error: '#B3392C',
        warning: '#C7862B',
        info: '#4C7A92',
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'serif'],
        body: ['"Public Sans"', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: { sm: '4px', md: '8px', lg: '16px', full: '999px' },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delay': 'float 3s ease-in-out 1s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'wave': 'wave 8s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #0c4a6e 0%, #075985 40%, #0e7490 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)',
      },
      boxShadow: {
        'ocean': '0 4px 24px -4px rgba(12, 74, 110, 0.2)',
        'ocean-lg': '0 12px 40px -8px rgba(12, 74, 110, 0.3)',
        'card': '0 1px 3px 0 rgba(12, 74, 110, 0.08), 0 1px 2px -1px rgba(12, 74, 110, 0.08)',
        'card-hover': '0 4px 12px -2px rgba(12, 74, 110, 0.15), 0 2px 6px -2px rgba(12, 74, 110, 0.1)',
      },
    },
  },
  plugins: [],
}
