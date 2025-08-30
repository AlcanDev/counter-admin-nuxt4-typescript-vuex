// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  typescript: { strict: true },
  css: ['./styles/tokens.css', './styles/main.css'],
  vite: { define: { __VUE_PROD_DEVTOOLS__: false } },
  pages: true,
  app: {
    head: {
      title: 'Contadores',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
});
