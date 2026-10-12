import { createGroupConfig } from '@internals/shared'

import { resolveContractClient } from '@internals/client'
import { definePlugin, Resolver } from 'kubb/kit'
import { version } from '../package.json'
import { pluginTsName } from '@kubb/plugin-ts'
import { pluginZodName } from '@kubb/plugin-zod'
import { mcpGenerator } from './generators/mcpGenerator.tsx'
import { serverGenerator } from './generators/serverGenerator.tsx'
import { resolverMcp } from './resolvers/resolverMcp.ts'
import type { PluginMcp, ResolverMcp } from './types.ts'

/**
 * Canonical plugin name for `@kubb/plugin-mcp`. Used for driver lookups and
 * cross-plugin dependency references.
 */
export const pluginMcpName = 'plugin-mcp' satisfies PluginMcp['name']

/**
 * Generates a Model Context Protocol (MCP) server from an OpenAPI spec. Every
 * operation becomes a typed MCP tool that AI assistants (Claude Desktop, Claude
 * Code, MCP-compatible clients) can call directly. Each handler calls a contract
 * client `<op>` from a registered `@kubb/plugin-axios` or `@kubb/plugin-fetch`.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'kubb/config'
 * import { pluginTs } from '@kubb/plugin-ts'
 * import { pluginZod } from '@kubb/plugin-zod'
 * import { pluginMcp } from '@kubb/plugin-mcp'
 *
 * export default defineConfig({
 *   input: './petStore.yaml',
 *   output: { path: './src/gen' },
 *   plugins: [
 *     pluginTs(),
 *     pluginZod(),
 *     pluginMcp({
 *       output: { path: './mcp' },
 *       baseURL: 'https://petstore.swagger.io/v2',
 *     }),
 *   ],
 * })
 * ```
 */
export const pluginMcp = definePlugin<PluginMcp>({
  meta: { name: pluginMcpName, version, compatibility: { kubb: '>=5.7.0' } },
  dependencies: { [pluginTsName]: {}, [pluginZodName]: {} },
  setup(options, kubb) {
    const {
      output = { path: 'mcp', barrel: { type: 'named' } },
      group,
      exclude = [],
      include,
      override = [],
      client,
      resolver: userResolver,
      macros: userMacros,
    } = options

    const resolver = userResolver ? Resolver.merge<ResolverMcp>(resolverMcp, userResolver) : resolverMcp

    kubb.setResolver(resolver)
    if (userMacros?.length) {
      kubb.setMacros(userMacros)
    }
    kubb.addGenerator(mcpGenerator, serverGenerator)

    return {
      output,
      exclude,
      include,
      override,
      group: createGroupConfig(group),
      client: resolveContractClient({ client, plugins: kubb.config.plugins }),
      resolver,
    }
  },
})

export default pluginMcp
