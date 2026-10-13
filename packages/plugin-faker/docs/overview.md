# Faker

Generates a Faker.js mock-data factory for every schema in your OpenAPI spec. Use the factories in tests, Storybook, and local development without a running backend. Each factory accepts partial data that overrides the generated values.

`@kubb/plugin-msw` can use these factories to fill mock responses.

## Setup

- Add `@kubb/plugin-ts` for the factory return types.
- Install `@faker-js/faker` v9 or higher in the app that uses the generated code.

## Options worth knowing

- `seed` passes a fixed seed to `faker.seed(...)`, so every run returns the same data.
- `locale` sets the Faker locale. The default is `en`.
- `dateParser` formats date and time strings with `faker` (default), `dayjs`, or `moment`. Install the library you pick.
- `regexGenerator` turns a `pattern` into a string with `faker` (default) or `randexp`.
- `typeMode` sets the factory types: `inferred` (default) derives them from the generated values, `schema` uses the declared model type.

## Example

```typescript [kubb.config.ts]
import { defineConfig } from 'kubb/config'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginFaker } from '@kubb/plugin-faker'

export default defineConfig({
  input: './petStore.yaml',
  output: { path: './src/gen' },
  plugins: [
    pluginTs(),
    pluginFaker({ seed: [100] }),
  ],
})
```

## See also

- [Faker.js](https://fakerjs.dev/)
- [@kubb/plugin-ts](https://kubb.dev/extensions/kubb-labs/plugin-ts)
- [@kubb/plugin-msw](https://kubb.dev/extensions/kubb-labs/plugin-msw)
