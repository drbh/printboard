import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "generate-static-pages",
      async buildStart() {
        try {
          await execPromise("node scripts/build-static-pages.js");
        } catch (error) {
          console.error("Error generating static pages:", error);
          throw error;
        }
      },
    },
  ],
});
