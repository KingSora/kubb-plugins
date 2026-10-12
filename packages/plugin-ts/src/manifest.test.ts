import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginTsName } from './plugin.ts'

test('kubb-extension.json describes pluginTs', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginTsName, entry })
})
