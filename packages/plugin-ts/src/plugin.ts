import { createGroupConfig } from '@internals/shared'
import { addGenerator, assertPluginOption, definePlugin, Resolver, setMacros, setResolver } from 'kubb/kit'
import { version } from '../package.json'
import { typeGenerator } from './generators/typeGenerator.tsx'
import { resolverTs } from './resolvers/resolverTs.ts'
import type { PluginTs, ResolvedOptions } from './types.ts'

/**
 * Canonical plugin name for `@kubb/plugin-ts`. Used for driver lookups and
 * cross-plugin dependency references.
 */
export const pluginTsName = 'plugin-ts' satisfies PluginTs['name']

const allowedEnumTypes = ['asConst', 'enum', 'constEnum', 'literal', 'inlineLiteral'] satisfies Array<ResolvedOptions['enum']['type']>
const allowedSyntaxTypes = ['type', 'interface'] satisfies Array<ResolvedOptions['syntaxType']>
const allowedArrayTypes = ['array', 'generic'] satisfies Array<ResolvedOptions['arrayType']>
const allowedOptionalTypes = ['questionToken', 'undefined', 'questionTokenAndUndefined'] satisfies Array<ResolvedOptions['optionalType']>

/**
 * Throws when an enum-like option holds a value outside its allowed set. Options left out are skipped.
 */
function assertEnumLikeOptions({
  prefix,
  options,
}: {
  prefix: string
  options: Partial<Pick<ResolvedOptions, 'enum' | 'syntaxType' | 'arrayType' | 'optionalType'>>
}): void {
  const checks = [
    { option: 'enum.type', value: options.enum?.type, allowed: allowedEnumTypes },
    { option: 'syntaxType', value: options.syntaxType, allowed: allowedSyntaxTypes },
    { option: 'arrayType', value: options.arrayType, allowed: allowedArrayTypes },
    { option: 'optionalType', value: options.optionalType, allowed: allowedOptionalTypes },
  ]
  for (const { option, value, allowed } of checks) {
    if (value !== undefined) assertPluginOption({ plugin: pluginTsName, option: `${prefix}${option}`, value, allowed })
  }
}

/**
 * Generates TypeScript `type` aliases and `interface` declarations from an
 * OpenAPI spec. The foundation that every other Kubb plugin builds on:
 * clients, query hooks, mocks, and validators all reference the names this
 * plugin produces.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'kubb/config'
 * import { pluginTs } from '@kubb/plugin-ts'
 *
 * export default defineConfig({
 *   input: './petStore.yaml',
 *   output: { path: './src/gen' },
 *   plugins: [
 *     pluginTs({
 *       output: { path: './types' },
 *       enum: { type: 'asConst' },
 *       optionalType: 'questionTokenAndUndefined',
 *     }),
 *   ],
 * })
 * ```
 */
export const pluginTs = definePlugin<PluginTs>({
  meta: { name: pluginTsName, version, compatibility: { kubb: '>=5.8.0' } },
  setup(options) {
    const {
      output = { path: 'types', barrel: { type: 'named' } },
      group,
      exclude = [],
      include,
      override = [],
      enum: enumOptions = {},
      optionalType = 'questionToken',
      arrayType = 'array',
      syntaxType = 'type',
      printer,
      resolver: userResolver,
      macros: userMacros,
    } = options

    const resolvedEnum = {
      type: enumOptions.type ?? 'asConst',
      constCasing: enumOptions.constCasing ?? 'camelCase',
      typeSuffix: enumOptions.typeSuffix ?? 'Key',
      keyCasing: enumOptions.keyCasing ?? 'none',
    }

    assertEnumLikeOptions({ prefix: '', options: { enum: resolvedEnum, syntaxType, arrayType, optionalType } })
    // An override replaces these per operation or schema, so its values are checked too.
    for (const [index, entry] of override.entries()) {
      assertEnumLikeOptions({ prefix: `override[${index}].options.`, options: entry.options })
    }

    setResolver(userResolver ? Resolver.merge(resolverTs, userResolver) : resolverTs)
    if (userMacros?.length) {
      setMacros(userMacros)
    }
    addGenerator(typeGenerator)

    return {
      output,
      exclude,
      include,
      override,
      optionalType,
      group: createGroupConfig(group),
      arrayType,
      enum: resolvedEnum,
      syntaxType,
      printer,
    }
  },
})

export default pluginTs
