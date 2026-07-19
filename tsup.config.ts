import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },
    format: ["cjs"],
    sourcemap: true,
    minify: "terser",
    splitting: false,
    terserOptions: {
      mangle: {
        keep_classnames: false,
        keep_fnames: false,
      },
      compress: {
        keep_classnames: false,
        keep_fnames: false,
      },
    },
    clean: true,
  },
]);
