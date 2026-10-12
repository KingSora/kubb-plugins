import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginClientName } from './plugin.ts'

test('kubb-extension.json describes pluginClient', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginClientName, entry })
})
