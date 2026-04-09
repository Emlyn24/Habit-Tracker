export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        pop: {
          '0%':   { transform: 'scale(0.85)' },
          '60%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        ripple: {
          '0%':   { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
      animation: {
        pop: 'pop 0.3s ease-out',
        ripple: 'ripple 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
