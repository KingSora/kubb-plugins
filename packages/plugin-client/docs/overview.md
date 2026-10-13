# Client

Generates typed operation functions from your OpenAPI spec that call a client module you write. You decide the transport, authentication, and error handling, and the generated code has no Fetch, axios, or Kubb runtime dependency.

Each function takes grouped `path`, `query`, `headers`, and `body` parameters and passes the operation's auth requirements to your client in a `security` list. A single call can pass its own `client` to replace the default.

Use it for signed requests, a shared client, or an existing HTTP layer. For a ready-made client, use `@kubb/plugin-fetch` or `@kubb/plugin-axios` instead.

## Setup

- Set `importPath` to your client module. It is required. The module must export `client` and the `Options` and `RequestResult` types.
- Add `@kubb/plugin-ts` for the operation types.
- Add `@kubb/plugin-zod` when you set `validator`. Generation fails without it.

## Options worth knowing

- `importPath` is written into every generated import as given, so it must resolve from the generated file. A relative path, a package name, or an alias works.
- `validator: 'zod'` passes request and response schemas from `@kubb/plugin-zod` to your client.
- `throwOnErrorDefault` is the `throwOnError` value each call passes to your client. The default is `true`.

## Example

```typescript [kubb.config.ts]
import { defineConfig } from 'kubb/config'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginClient } from '@kubb/plugin-client'

export default defineConfig({
  input: './petStore.yaml',
  output: { path: './src/gen' },
  plugins: [
    pluginTs(),
    pluginClient({
      output: { path: 'clients', mode: 'directory', barrel: { type: 'named' } },
      group: { type: 'tag' },
      // resolved from each generated file: src/gen/clients/<tag>/ to src/client.ts
      importPath: '../../../client',
    }),
  ],
})
```

## See also

- [`@kubb/plugin-fetch`](https://kubb.dev/extensions/kubb-labs/plugin-fetch)
- [`@kubb/plugin-axios`](https://kubb.dev/extensions/kubb-labs/plugin-axios)
- [Example project](https://github.com/kubb-labs/plugins/tree/main/examples/client)
