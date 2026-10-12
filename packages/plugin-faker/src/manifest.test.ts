import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginFakerName } from './plugin.ts'

test('kubb-extension.json describes pluginFaker', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginFakerName, entry })
})
