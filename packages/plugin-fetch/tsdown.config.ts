import { copyFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig, type UserConfig } from 'tsdown'

const entry = {
  index: 'src/index.ts',
}

const shared: Partial<UserConfig> = {
  platform: 'node',
  sourcemap: true,
  shims: true,
  fixedExtension: false,
  deps: {
    neverBundle: [/^@kubb\//],
    alwaysBundle: [/@internals/],
  },
  outputOptions: {
    keepNames: true,
  },
}

export default defineConfig([
  {
    entry,
    format: 'esm',
    dts: false,
    ...shared,
  },
  {
    entry,
    format: 'cjs',
    dts: false,
    ...shared,
  },
  {
    // Declarations get their own build: `keepNames` leaks an untyped `__name` helper into .d.ts/.d.cts files.
    // The .d.cts is a copy of the .d.ts, so one TypeScript program serves both formats instead of two at once.
    entry,
    format: 'esm',
    ...shared,
    outputOptions: {},
    dts: { emitDtsOnly: true },
    hooks: {
      'build:done': ({ options }) => copyFile(path.join(options.outDir, 'index.d.ts'), path.join(options.outDir, 'index.d.cts')),
    },
  },
  {
    // Declarations for the raw templates so consumers can import their types without `allowImportingTsExtensions`.
    entry: {
      'templates/fetch': 'templates/fetch.ts',
      'templates/serializers': 'templates/serializers.ts',
      'templates/standardSchema': 'templates/standardSchema.ts',
    },
    format: 'esm',
    fixedExtension: false,
    dts: { emitDtsOnly: true },
  },
])
