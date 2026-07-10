// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        // Vinculamos el nombre exacto que provee Fontsource
        space: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}