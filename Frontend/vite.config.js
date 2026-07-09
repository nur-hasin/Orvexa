import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // React
          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("scheduler")
          ) {
            return "react";
          }

          // Router
          if (id.includes("react-router-dom")) {
            return "router";
          }

          // Markdown + Math + Syntax Highlighting
          if (
            id.includes("react-markdown") ||
            id.includes("remark-gfm") ||
            id.includes("remark-math") ||
            id.includes("rehype-katex") ||
            id.includes("rehype-highlight") ||
            id.includes("highlight.js") ||
            id.includes("katex")
          ) {
            return "markdown";
          }

          // UI Libraries
          if (id.includes("react-spinners")) {
            return "ui";
          }

          // Everything else
          return "vendor";
        },
      },
    },
  },
});
