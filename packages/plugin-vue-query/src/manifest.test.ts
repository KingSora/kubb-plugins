import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginVueQueryName } from './plugin.ts'

test('kubb-extension.json describes pluginVueQuery', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginVueQueryName, entry })
})
