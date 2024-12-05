import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/config.ts'
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: true,
  treeshake: true,
  platform: 'node',
  target: 'node23',
  noExternal: ["@supabase/supabase-js", "dotenv"]
}) 