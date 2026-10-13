# MSW

Generates typed MSW request handlers from your OpenAPI spec, one per operation. Use them to mock the API in tests and during local development.

Each handler returns the data you pass to it. With `parser: 'faker'`, it falls back to mock data from `@kubb/plugin-faker` when you pass none.

## Setup

- Add `@kubb/plugin-ts`.
- Add `@kubb/plugin-faker` when you set `parser: 'faker'`. The default `data` parser does not need it.
- Install MSW v2 or higher in the app that uses the generated code.

## Options worth knowing

- `parser` sets where the response body comes from: `data` (default) or `faker`.
- `handlers` writes a `handlers.ts` file that exports every handler, ready to spread into `setupServer` or `setupWorker`.
- `baseURL` is prepended to the path each handler matches.

## Example

```typescript [kubb.config.ts]
import { defineConfig } from 'kubb/config'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginMsw } from '@kubb/plugin-msw'

export default defineConfig({
  input: './petStore.yaml',
  output: { path: './src/gen' },
  plugins: [
    pluginTs(),
    pluginMsw({ output: { path: 'handlers', mode: 'directory' }, handlers: true }),
  ],
})
```

## See also

- [MSW](https://mswjs.io/)
- [@kubb/plugin-ts](https://kubb.dev/extensions/kubb-labs/plugin-ts)
- [@kubb/plugin-faker](https://kubb.dev/extensions/kubb-labs/plugin-faker)
