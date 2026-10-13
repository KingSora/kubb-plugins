# Redoc

The Redoc plugin generates a single HTML page that documents your OpenAPI spec with Redoc. The page is rebuilt on every Kubb run, so the docs always match the spec your code comes from.

The whole spec is embedded in the page, so you can publish it to any static host without a build step. Viewing the page needs network access, because it loads the latest Redoc bundle from `cdn.redoc.ly` and its fonts from Google Fonts.

## Setup

No other plugins or packages are needed. The plugin reads the spec through the default OpenAPI adapter, `adapterOas`, and fails with any other adapter.

## Options worth knowing

- `output.path` is the path of the HTML file, relative to the root `output.path`. The default is `docs.html`. It points at a file, not a folder, so end it with `.html`. It is the only option.

See [Options](https://kubb.dev/extensions/kubb-labs/plugin-redoc/options) for its type and default.

## Example

The config below writes the page to `src/gen/docs.html`.

```typescript [kubb.config.ts]
import { defineConfig } from 'kubb/config'
import { pluginRedoc } from '@kubb/plugin-redoc'

export default defineConfig({
  input: './petStore.yaml',
  output: { path: './src/gen' },
  plugins: [
    pluginRedoc({ output: { path: 'docs.html' } }),
  ],
})
```

## See also

- [Redoc](https://redocly.com/redoc)
- [`@kubb/adapter-oas`](https://kubb.dev/extensions/kubb-labs/adapter-oas)
