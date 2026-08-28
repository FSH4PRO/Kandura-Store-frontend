/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: "#f3f5f8",
          100: "#e4e8ef",
          200: "#c3cbdb",
          300: "#94a1bd",
          400: "#5f6f97",
          500: "#3d4b70",
          600: "#2b3757",
          700: "#212a44",
          800: "#171d30",
          900: "#0f1420",
          950: "#0a0e18",
        },
        gold: {
          50: "#fbf7ea",
          100: "#f5ecc9",
          200: "#ecd996",
          300: "#e2c265",
          400: "#d4af37",
          500: "#bd9526",
          600: "#96741d",
          700: "#71561a",
        },
        ivory: "#FAF9F6",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,20,32,0.04), 0 12px 32px -12px rgba(15,20,32,0.14)",
        "card-hover": "0 1px 2px rgba(15,20,32,0.06), 0 20px 40px -14px rgba(15,20,32,0.22)",
        gold: "0 8px 24px -8px rgba(212,175,55,0.45)",
      },
      borderRadius: {
        "xl-2": "1.25rem",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
