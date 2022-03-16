module.exports = {
  content: [
    "./src/**/*.{html,js,ejs}",
    "./views/**/*.ejs"
  ],
  theme: {
    extend: {
      colors: {
        "Amaranth": { DEFAULT: "#ED3F54", "50": "#FDE7EA", "100": "#FBD4D9", "200": "#F7AFB8", "300": "#F48A96", "400": "#F06475", "500": "#ED3F54", "600": "#DF152D", "700": "#AC1023", "800": "#780B18", "900": "#45060E" }
      }
    }
  },
  plugins: [require("kutty"), require("@tailwindcss/forms")]
};
//# sourceMappingURL=tailwind.config.js.map
