import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginSwrName } from './plugin.ts'

test('kubb-extension.json describes pluginSwr', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginSwrName, entry })
})
