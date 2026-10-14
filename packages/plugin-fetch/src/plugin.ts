import { fileURLToPath } from 'node:url'
import { createClientGenerator, createClientPlugin, resolveClientOptions } from '@internals/client'
import { compatibility } from '../kubb-extension.json'
import { version } from '../package.json'
import type { PluginFetch } from './types.ts'

/**
 * Canonical plugin name for `@kubb/plugin-fetch`. Used for driver lookups and cross-plugin
 * dependency references.
 */
export const pluginFetchName = 'plugin-fetch' satisfies PluginFetch['name']

/**
 * Built-in operation generator for `@kubb/plugin-fetch`. Emits one async function per OpenAPI
 * operation using the shared `Operation` component: a grouped `<Name>Request` type and a function
 * that forwards a single `options` object to the bundled `client` and returns the `RequestResult`.
 */
export const clientGenerator = createClientGenerator<PluginFetch>('fetch')

/**
 * Generates a type-safe HTTP client pinned to the Fetch API. Each operation becomes one async
 * function that takes a single grouped `options` object and returns the shared `RequestResult`
 * contract. The runtime is always bundled into `.kubb/client.ts`, so generated code never imports
 * from `@kubb/plugin-fetch` and the only runtime dependency is the global `fetch`.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'kubb/config'
 * import { pluginTs } from '@kubb/plugin-ts'
 * import { pluginFetch } from '@kubb/plugin-fetch'
 *
 * export default defineConfig({
 *   input: './petStore.yaml',
 *   output: { path: './src/gen' },
 *   plugins: [
 *     pluginTs(),
 *     pluginFetch({ output: { path: './clients' } }),
 *   ],
 * })
 * ```
 */
export const pluginFetch = createClientPlugin({
  meta: { name: pluginFetchName, version, compatibility },
  generator: clientGenerator,
  templates: {
    client: fileURLToPath(new URL('../templates/fetch.ts', import.meta.url)),
    serializers: fileURLToPath(new URL('../templates/serializers.ts', import.meta.url)),
    standardSchema: fileURLToPath(new URL('../templates/standardSchema.ts', import.meta.url)),
  },
  resolveOptions: resolveClientOptions,
})

export default pluginFetch
