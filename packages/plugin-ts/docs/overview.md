# TypeScript

The TypeScript plugin generates a type or interface for every schema in your OpenAPI spec, plus the request, response, and parameter types of each operation.

The client, query, mock, and test plugins import these types, so add this plugin whenever you use them. Kubb runs it before the plugins that need it, whatever the order of the `plugins` array.

## Setup

No other plugins or packages are needed.

## Options worth knowing

- `enum.type` sets how enums are written: `asConst` (default), `enum`, `constEnum`, `literal`, or `inlineLiteral`. `enum.constCasing`, `enum.typeSuffix`, and `enum.keyCasing` tune the names.
- `syntaxType` writes object schemas as `type` aliases (default) or `interface` declarations.
- `optionalType` sets how optional properties are written: `questionToken` (default), `undefined`, or `questionTokenAndUndefined`.
- `arrayType` writes arrays as `T[]` (default) or `Array<T>`.
- `group` splits the output into folders by tag or path. It does not work with `output.mode: 'file'`.

With the default OpenAPI adapter, `int64` fields are typed as `bigint`, while JSON responses hold numbers. Set `integerType: 'number'` on `adapterOas` for most JSON APIs.

See [Options](https://kubb.dev/extensions/kubb-labs/plugin-ts/options) for every option and its default.

## Example

The config below generates the types into `src/gen/types`.

```typescript [kubb.config.ts]
import { defineConfig } from 'kubb/config'
import { pluginTs } from '@kubb/plugin-ts'

export default defineConfig({
  input: './petStore.yaml',
  output: { path: './src/gen' },
  plugins: [
    pluginTs(),
  ],
})
```

## See also

- [TypeScript](https://www.typescriptlang.org/)
- [`@kubb/adapter-oas`](https://kubb.dev/extensions/kubb-labs/adapter-oas)
