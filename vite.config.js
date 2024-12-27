import { defineConfig } from "vitest/config"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  root: path.resolve(__dirname, "./"),
  test: {
    globals: true,
    environment: "node",
    reporters: ["default"],
    silent: false,
    include: ["**/*.{test, spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["**/node_modules/**"],
  },
})
