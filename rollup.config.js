import { defineConfig } from 'rollup'
import path from 'path'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'

export default defineConfig([
  {
    input: './src/index.ts',
    output: [
      {
        file: path.resolve('./dist/index.cjs'),
        format: 'cjs',
      },
      {
        file: path.resolve('./dist/index.mjs'),
        format: 'es',
      },
    ],
    plugins: [terser(), typescript(), babel()],
  },
])
