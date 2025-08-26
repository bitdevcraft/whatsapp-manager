import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: "src/index.ts",
    repositories: "src/repositories/index.ts",
    schema: "src/schema/index.ts",
  },
  format: ["cjs", "esm"],
  sourcemap: true,
});
