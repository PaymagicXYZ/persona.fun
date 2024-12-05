import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  bundle: true,
  splitting: false,
  treeshake: true,
  platform: 'node',
  target: 'node23',
  noExternal: [
    "@persona/*",
    "ioredis",
    "@supabase/supabase-js",
    "dotenv"
  ],
  esbuildOptions: (options) => {
    options.alias = {
      "@persona/utils/proofs": "../../packages/utils/dist/proofs",
      "@persona/utils/merkle-tree": "../../packages/utils/dist/merkle-tree",
      "@persona/utils": "../../packages/utils/dist",
      "@persona/db": "../../packages/db/dist",
      "@persona/db/config": "../../packages/db/dist/config"
    }
  }
}); 