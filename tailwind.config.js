/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#0B2447",
        secondary: "#80B0C0",
        third: "#A5D7E8",
        darkText: "#7C7C7C",
        lightText: "#F5F5F5",
        semiLightText: "#719CAB",
        bgRadialStart: "#234E9A",
        bgRadialEnd: "#19376D",
        purple: "#6842FF",
        darkPurple: "#1D2D7D",
      },
      spacing: {
        380: "380px",
        1180: "1180px",
      },
      maxWidth: {
        1180: "1180px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(closest-side, #234E9A, #19376D, #19376D)",
      },
    },
    animation: {
      "fade-in": "fadeIn 0.5 ease-in-out forwards",
    },
    keyframes: {
      fadeIn: {
        "0%": {
          visibility: "visible",
        },
        "100%": {
          visibility: "hidden",
        },
      },
    },
  },
  plugins: [],
};
