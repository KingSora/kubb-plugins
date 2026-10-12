import { createGroupConfig } from '@internals/shared'
import { definePlugin, Resolver } from 'kubb/kit'
import { version } from '../package.json'
import { zodGenerator } from './generators/zodGenerator.tsx'
import { resolverZod } from './resolvers/resolverZod.ts'
import type { PluginZod } from './types.ts'

/**
 * Canonical plugin name for `@kubb/plugin-zod`. Used for driver lookups and
 * cross-plugin dependency references.
 */
export const pluginZodName = 'plugin-zod' satisfies PluginZod['name']

/**
 * Generates Zod v4 schemas from an OpenAPI spec. Use them to validate API
 * responses at runtime, build form schemas, or feed back into router libraries
 * that consume Zod (tRPC, Hono, Elysia). Pair with `@kubb/plugin-axios` or
 * `@kubb/plugin-fetch` and set the client's `validator: 'zod'` to validate every response
 * automatically.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'kubb/config'
 * import { pluginTs } from '@kubb/plugin-ts'
 * import { pluginZod } from '@kubb/plugin-zod'
 *
 * export default defineConfig({
 *   input: './petStore.yaml',
 *   output: { path: './src/gen' },
 *   plugins: [
 *     pluginTs(),
 *     pluginZod({
 *       output: { path: './zod' },
 *       inferred: true,
 *     }),
 *   ],
 * })
 * ```
 */
export const pluginZod = definePlugin<PluginZod>({
  meta: { name: pluginZodName, version, compatibility: { kubb: '>=5.7.0' } },
  setup(options, kubb) {
    const {
      output = { path: 'zod', barrel: { type: 'named' } },
      group,
      exclude = [],
      include,
      override = [],
      compile = false,
      mini = false,
      guidType = 'uuid',
      regexType = 'literal',
      importPath = mini ? 'zod/mini' : 'zod',
      coercion = false,
      inferred = false,
      typeGuards = false,
      printer,
      resolver: userResolver,
      macros: userMacros,
    } = options

    kubb.setResolver(userResolver ? Resolver.merge(resolverZod, userResolver) : resolverZod)
    if (userMacros?.length) {
      kubb.setMacros(userMacros)
    }
    kubb.addGenerator(zodGenerator)

    return {
      output,
      exclude,
      include,
      override,
      group: createGroupConfig(group),
      importPath,
      coercion,
      inferred,
      guidType,
      regexType,
      compile,
      mini,
      typeGuards,
      printer,
    }
  },
})

export default pluginZod
