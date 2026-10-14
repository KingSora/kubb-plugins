import { createClientGenerator, createClientPlugin, resolveClientOptions } from '@internals/client'
import { compatibility } from '../kubb-extension.json'
import { version } from '../package.json'
import type { PluginClient } from './types.ts'

/**
 * Canonical plugin name for `@kubb/plugin-client`.
 */
export const pluginClientName = 'plugin-client' satisfies PluginClient['name']

/**
 * Built-in operation generator for `@kubb/plugin-client`. Emits one async function per OpenAPI
 * operation using the shared `Operation` component: a grouped `<Name>Request` type and a function
 * that forwards a single `options` object to the user-provided client module and returns the `RequestResult`.
 */
const clientGenerator = createClientGenerator<PluginClient>('client', (options) => options.importPath)

/**
 * Generates typed operations that call a client module owned by your application.
 * The module at `importPath` must export the runtime helpers and types used by generated operations.
 * Kubb does not copy or inject a transport implementation.
 *
 * @example
 * ```ts
 * pluginClient({ importPath: '../api/client' })
 * ```
 */
export const pluginClient = createClientPlugin({
  meta: { name: pluginClientName, version, compatibility },
  generator: clientGenerator,
  // The application owns the client module, so there is no baseURL, SDK, or return type to configure.
  resolveOptions: (options) => ({
    ...resolveClientOptions(options),
    baseURL: undefined,
    returnType: 'plain',
    sdk: undefined,
    importPath: options.importPath,
  }),
})

export default pluginClient
