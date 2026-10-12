import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginFetchName } from './plugin.ts'

test('kubb-extension.json describes pluginFetch', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginFetchName, entry })
})
