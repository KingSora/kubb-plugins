import { expectExtensionManifest } from '#mocks'
import { test } from 'vitest'
import * as entry from './index.ts'
import { pluginAxiosName } from './plugin.ts'

test('kubb-extension.json describes pluginAxios', () => {
  expectExtensionManifest(new URL('../kubb-extension.json', import.meta.url), { name: pluginAxiosName, entry })
})
