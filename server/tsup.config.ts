import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: ["src/**/*"],
  clean: true,
  format: ["cjs"],
  sourcemap: true,
}));
