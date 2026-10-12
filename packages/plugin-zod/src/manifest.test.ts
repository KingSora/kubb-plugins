import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginZodName } from './plugin.ts'

test('kubb-extension.json describes pluginZod', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginZodName, entry })
})
