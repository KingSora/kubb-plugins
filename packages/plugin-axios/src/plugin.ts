import { fileURLToPath } from 'node:url'
import { createClientGenerator, createClientPlugin, resolveClientOptions } from '@internals/client'
import { compatibility } from '../kubb-extension.json'
import { version } from '../package.json'
import type { PluginAxios } from './types.ts'

/**
 * Canonical plugin name for `@kubb/plugin-axios`. Used for driver lookups and cross-plugin
 * dependency references.
 */
export const pluginAxiosName = 'plugin-axios' satisfies PluginAxios['name']

/**
 * Built-in operation generator for `@kubb/plugin-axios`. Emits one async function per OpenAPI
 * operation using the shared `Operation` component: a grouped `<Name>Request` type and a function
 * that forwards a single `options` object to the bundled `client` and returns the `RequestResult`.
 */
export const clientGenerator = createClientGenerator<PluginAxios>('axios')

/**
 * Generates a type-safe HTTP client pinned to axios. Each operation becomes one async function
 * that takes a single grouped `options` object and returns the shared `RequestResult` contract. The
 * runtime is always bundled into `.kubb/client.ts`, so generated code never imports from
 * `@kubb/plugin-axios` and the only runtime dependency is `axios`.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'kubb/config'
 * import { pluginTs } from '@kubb/plugin-ts'
 * import { pluginAxios } from '@kubb/plugin-axios'
 *
 * export default defineConfig({
 *   input: './petStore.yaml',
 *   output: { path: './src/gen' },
 *   plugins: [
 *     pluginTs(),
 *     pluginAxios({ output: { path: './clients' } }),
 *   ],
 * })
 * ```
 */
export const pluginAxios = createClientPlugin({
  meta: { name: pluginAxiosName, version, compatibility },
  generator: clientGenerator,
  templates: {
    client: fileURLToPath(new URL('../templates/axios.ts', import.meta.url)),
    serializers: fileURLToPath(new URL('../templates/serializers.ts', import.meta.url)),
    standardSchema: fileURLToPath(new URL('../templates/standardSchema.ts', import.meta.url)),
  },
  resolveOptions: resolveClientOptions,
})

export default pluginAxios
