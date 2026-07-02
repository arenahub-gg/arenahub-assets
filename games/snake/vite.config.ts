import { defineConfig } from "vite";

// base './' so the built dist/ runs from any CDN path (self-contained rule)
export default defineConfig({
  base: "./",
});
