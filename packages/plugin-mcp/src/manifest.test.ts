import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginMcpName } from './plugin.ts'

test('kubb-extension.json describes pluginMcp', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginMcpName, entry })
})
