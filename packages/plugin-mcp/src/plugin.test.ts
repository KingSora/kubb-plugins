import { createKubb } from 'kubb'
import { definePlugin } from 'kubb/kit'
import { createMockedSetupContext } from 'kubb/kit/testing'
import { describe, expect, test } from 'vitest'
import { pluginMcp } from './plugin.ts'
import type { PluginMcp } from './types.ts'

function setupKubb(pluginNames: Array<string>) {
  const plugins = pluginNames.map((name) => definePlugin({ meta: { name } })())

  return createKubb({ input: './petStore.yaml', output: { path: './gen' }, plugins: [...plugins, pluginMcp()] }).setup()
}

describe('pluginMcp setup', () => {
  test('registers the generators', () => {
    const plugin = pluginMcp()
    const ctx = createMockedSetupContext<PluginMcp>({ plugins: ['plugin-ts', 'plugin-zod', 'plugin-fetch', 'plugin-mcp'] })

    plugin.setup?.(plugin.options ?? {}, ctx)

    expect(ctx.addGenerator).toHaveBeenCalledTimes(1)
  })

  test('passes when plugin-ts and plugin-zod are registered', async () => {
    await expect(setupKubb(['plugin-ts', 'plugin-zod', 'plugin-fetch'])).resolves.toBeUndefined()
  })

  test.each(['plugin-ts', 'plugin-zod'])('fails with KUBB_MISSING_DEPENDENCY when %s is not registered', async (missing) => {
    const registered = ['plugin-ts', 'plugin-zod', 'plugin-fetch'].filter((name) => name !== missing)

    await expect(setupKubb(registered)).rejects.toMatchObject({
      diagnostic: { code: 'KUBB_MISSING_DEPENDENCY', message: `Plugin "${missing}" is required by "plugin-mcp" but not found.` },
    })
  })
})
