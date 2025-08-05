import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: "src/index.ts",
    permissions: "src/lib/permissions.ts",
  },
  format: ["cjs", "esm"],
  sourcemap: true,
});
