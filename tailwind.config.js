/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{liquid,html,js}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        surface: "#fff",
        green: "#f3ffec",
        blue: "#f5f7ff",
        "light-cream": "#fffbf6",
        cream: "#fef7ee",
        brown: "#ede8e5",
        "off-white": "#fbfbfb",

        heading: "#151515",
        text: "#171717",
        "sub-text": "#8e8e8e",
        "price-cut": "#9a9a9a",
        "secondary-cta": "#585858",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar")({
      nocompatible: true,
      preferredStrategy: "pseudoelements",
    }),
    require('flowbite/plugin')
  ],
};