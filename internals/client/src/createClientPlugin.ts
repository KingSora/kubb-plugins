import path from 'node:path'
import { createGroupConfig } from '@internals/shared'
import { addGenerator, defineExtension, injectFile, Resolver, setMacros, setResolver, useConfig } from 'kubb/kit'
import type { ExtensionMeta, Generator, PluginFactory, PluginType } from 'kubb/kit'
import { pluginTsName } from '@kubb/plugin-ts'
import { pluginZodName } from '@kubb/plugin-zod'
import { defaultMacros } from './macros.ts'
import { resolverClient } from './resolver.ts'
import type { Options, ResolvedOptions, ResolverClient } from './types.ts'

/** Absolute paths of the runtime files a client plugin copies into `<root>/.kubb/`. */
type ClientTemplates = {
  client: string
  serializers: string
  standardSchema: string
}

type CreateClientPluginOptions<TName extends string, TOptions extends Options, TResolved extends ResolvedOptions> = {
  meta: ExtensionMeta & { name: TName }
  /** Emits one function per operation. */
  generator: Generator<PluginType<TName, TOptions, TResolved, ResolverClient>>
  /** Replaces `generator` when the user configures `sdk`. Passed in so plugins without an SDK do not bundle it. */
  sdkGenerator?: Generator<PluginType<TName, TOptions, TResolved, ResolverClient>>
  /** The runtime files copied into `.kubb/`. Leave out when the application owns the client module. */
  templates?: ClientTemplates
  /** Applies the plugin's defaults to the user options. */
  resolveOptions: (options: TOptions) => TResolved
}

/** Applies the defaults every client plugin shares to the user options. */
export function resolveClientOptions(options: Options): ResolvedOptions {
  const {
    output = { path: 'clients', barrel: { type: 'named' } },
    exclude = [],
    include,
    override = [],
    baseURL,
    throwOnErrorDefault = true,
    validator = false,
    returnType = 'full',
    group,
    sdk,
    resolver: userResolver,
  } = options

  return {
    output,
    exclude,
    include,
    override,
    group: createGroupConfig(group),
    baseURL,
    throwOnErrorDefault,
    validator,
    returnType,
    sdk: sdk ? { mode: sdk.mode ?? 'tag', name: sdk.name } : undefined,
    resolver: userResolver ? Resolver.merge<ResolverClient>(resolverClient, userResolver) : resolverClient,
  }
}

/** Builds a client plugin; copies `templates` into `.kubb/` when it bundles its own client. */
export function createClientPlugin<TName extends string, TOptions extends Options, TResolved extends ResolvedOptions>({
  meta,
  generator,
  sdkGenerator,
  templates,
  resolveOptions,
}: CreateClientPluginOptions<TName, TOptions, TResolved>): PluginFactory<PluginType<TName, TOptions, TResolved, ResolverClient>> {
  return defineExtension<PluginType<TName, TOptions, TResolved, ResolverClient>>({
    kind: 'plugin',
    meta,
    dependencies: (options) => ({ [pluginTsName]: { optional: true }, [pluginZodName]: { optional: !options.validator } }),
    setup(options) {
      const resolved = resolveOptions(options)

      setResolver(resolved.resolver)
      setMacros([...defaultMacros, ...(options.macros ?? [])])
      // `sdk` swaps the per-operation functions for the class-based SDK.
      addGenerator(resolved.sdk && sdkGenerator ? sdkGenerator : generator)

      if (templates) {
        const config = useConfig()
        const root = path.resolve(config.root, config.output.path)
        const baseURLExpression = resolved.baseURL
          ? resolved.baseURL.includes('${')
            ? `\`${resolved.baseURL.replaceAll('`', '\\`')}\``
            : JSON.stringify(resolved.baseURL)
          : undefined

        injectFile({ baseName: 'serializers.ts', path: path.resolve(root, '.kubb/serializers.ts'), copy: templates.serializers })
        injectFile({
          baseName: 'client.ts',
          path: path.resolve(root, '.kubb/client.ts'),
          copy: templates.client,
          footer: baseURLExpression ? `client.setConfig({ baseURL: ${baseURLExpression} })` : undefined,
        })
        injectFile({ baseName: 'standardSchema.ts', path: path.resolve(root, '.kubb/standardSchema.ts'), copy: templates.standardSchema })
      }

      return resolved
    },
  })
}
