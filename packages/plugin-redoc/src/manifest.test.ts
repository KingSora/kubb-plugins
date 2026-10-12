import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginRedocName } from './plugin.ts'

test('kubb-extension.json describes pluginRedoc', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginRedocName, entry })
})
