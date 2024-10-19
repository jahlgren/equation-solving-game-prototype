/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./public/**/*.{html,js}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        showMeme: {
          '0%': { transform: 'scale(0.5) rotate(-10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' }
        }
      },
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
        "show-meme": "showMeme 1s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }
    },
  },
  plugins: [],
}

