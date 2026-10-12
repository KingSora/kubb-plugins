import { createGroupConfig } from '@internals/shared'
import { definePlugin, Resolver } from 'kubb/kit'
import { version } from '../package.json'
import { pluginTsName } from '@kubb/plugin-ts'
import { pluginZodName } from '@kubb/plugin-zod'
import { clientGenerator } from './generators/clientGenerator.tsx'
import { defaultMacros, resolverClient } from '@internals/client'
import type { PluginClient, ResolverClient } from './types.ts'

/**
 * Canonical plugin name for `@kubb/plugin-client`.
 */
export const pluginClientName = 'plugin-client' satisfies PluginClient['name']

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
export const pluginClient = definePlugin<PluginClient>({
  meta: { name: pluginClientName, version },
  dependencies: (options) => ({ [pluginTsName]: { optional: true }, [pluginZodName]: { optional: !options.validator } }),
  setup(options, kubb) {
    const {
      output = { path: 'clients', barrel: { type: 'named' } },
      exclude = [],
      include,
      override = [],
      importPath,
      throwOnErrorDefault = true,
      validator = false,
      group,
      resolver: userResolver,
    } = options

    const resolver = userResolver ? Resolver.merge<ResolverClient>(resolverClient, userResolver) : resolverClient

    kubb.setResolver(resolver)
    kubb.setMacros([...defaultMacros, ...(options.macros ?? [])])
    kubb.addGenerator(clientGenerator)

    return {
      output,
      exclude,
      include,
      override,
      group: createGroupConfig(group),
      importPath,
      baseURL: undefined,
      throwOnErrorDefault,
      validator,
      returnType: 'plain',
      sdk: undefined,
      resolver,
    }
  },
})

export default pluginClient
