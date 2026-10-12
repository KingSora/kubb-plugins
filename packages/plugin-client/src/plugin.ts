import { createGroupConfig } from '@internals/shared'
import { addGenerator, definePlugin, Resolver, setMacros, setResolver, usePlugin } from 'kubb/kit'
import { pluginTsName } from '@kubb/plugin-ts'
import { pluginZodName } from '@kubb/plugin-zod'
import { clientGenerator } from './generators/clientGenerator.tsx'
import { defaultMacros, resolverClient } from '@internals/client'
import type { PluginClient, ResolvedOptions, ResolverClient } from './types.ts'

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
export const pluginClient = definePlugin<PluginClient>((options) => {
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

  const resolved: ResolvedOptions = {
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
    resolver: userResolver ? Resolver.merge<ResolverClient>(resolverClient, userResolver) : resolverClient,
  }

  return {
    name: pluginClientName,
    options,
    dependencies: [pluginTsName, pluginZodName],
    hooks: {
      'kubb:plugin:setup'(ctx) {
        if (validator) usePlugin(pluginZodName)

        ctx.setOptions(resolved)
        setResolver(resolved.resolver)
        setMacros([...defaultMacros, ...(options.macros ?? [])])
        addGenerator(clientGenerator)
      },
    },
  }
})

export default pluginClient
