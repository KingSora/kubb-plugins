import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginReactQueryName } from './plugin.ts'

test('kubb-extension.json describes pluginReactQuery', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginReactQueryName, entry })
})
