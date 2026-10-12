import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginCypressName } from './plugin.ts'

test('kubb-extension.json describes pluginCypress', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginCypressName, entry })
})
