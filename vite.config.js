import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: "public/manifest.json", dest: "." },
        { src: "public/icons", dest: "icons" },
      ],
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        content: path.resolve(__dirname, "src/content.js"),
        background: path.resolve(__dirname, "src/background.js"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "content") return "content.js";
          if (chunk.name === "background") return "background.js";
          return "assets/[name].js";
        },
      },
    },
  },
});
