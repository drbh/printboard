import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-ignore
import { exec } from "child_process";
// @ts-ignore
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
          throw error;
        }
      },
    },
  ],
});
