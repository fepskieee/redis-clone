import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    exclude: [
      "**/node_modules/**",
      ".redis.drawio",
      "**/.{git}/**",
      "**/{vite,vitest}.config.*",
    ],
  },
})
