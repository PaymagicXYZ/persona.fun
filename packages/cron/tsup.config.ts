import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/update-merkle-tree.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  platform: 'node',
  target: 'node23',
  shims: true,
  external: ['@persona/db'],
  esbuildOptions(options) {
    options.tsconfig = './tsconfig.json'
  }
})
