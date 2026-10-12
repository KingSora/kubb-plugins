import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginMswName } from './plugin.ts'

test('kubb-extension.json describes pluginMsw', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginMswName, entry })
})
