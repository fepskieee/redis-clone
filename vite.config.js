import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.js", "src/**/*.js"],
    exclude: [
      "**/node_modules/**",
      "**/.redis.drawio/**",
      "**/.{git}/**",
      "**/{vite,vitest}.config.*",
    ],
  },
})
