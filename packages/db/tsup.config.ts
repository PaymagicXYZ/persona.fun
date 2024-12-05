import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  platform: 'node',
  target: 'node23',
  noExternal: ["@supabase/supabase-js", "dotenv"]
}) 