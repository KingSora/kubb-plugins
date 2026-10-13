# Options

Pass these options to `pluginFetch()`. Shared options link to [Shared plugin options](https://kubb.dev/docs/5.x/reference/plugin-options), which documents their behavior once.

## Options overview

| Option                                                                                | Purpose                                                          | Default                                          |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| [`output`](https://kubb.dev/docs/5.x/reference/plugin-options#output)                 | Where the generated files are written and exported.              | `{ path: 'clients', barrel: { type: 'named' } }` |
| ↳ [`output.path`](https://kubb.dev/docs/5.x/reference/plugin-options#output-path)     | Choose the output folder or file.                                | `'clients'`                                      |
| ↳ [`output.mode`](https://kubb.dev/docs/5.x/reference/plugin-options#output-mode)     | Write a single file or a directory of files.                     | Inferred from `output.path`                      |
| ↳ [`output.barrel`](https://kubb.dev/docs/5.x/reference/plugin-options#output-barrel) | Configure barrel exports.                                        | `{ type: 'named' }`                              |
| ↳ [`output.banner`](https://kubb.dev/docs/5.x/reference/plugin-options#output-banner) | Add content before generated code.                               | None                                             |
| ↳ [`output.footer`](https://kubb.dev/docs/5.x/reference/plugin-options#output-footer) | Add content after generated code.                                | None                                             |
| [`group`](https://kubb.dev/docs/5.x/reference/plugin-options#group)                   | Split output into per-tag or per-path folders.                   | None                                             |
| ↳ [`group.type`](https://kubb.dev/docs/5.x/reference/plugin-options#group-type)       | Group operations by tag or URL path.                             | Required with `group`                            |
| ↳ [`group.name`](https://kubb.dev/docs/5.x/reference/plugin-options#group-name)       | Customize output group names.                                    | camelCased tag or raw path segment               |
| [`baseURL`](#baseurl)                                                                 | Base URL prepended to every request.                             | None                                             |
| [`throwOnErrorDefault`](#throwonerrordefault)                                         | Default error behavior and return type for generated operations. | `true`                                           |
| [`validator`](#validator)                                                             | Validate request and response bodies with Zod.                   | `false`                                          |
| ↳ [`validator.request`](#validator)                                                   | Validate request bodies with Zod.                                | None                                             |
| ↳ [`validator.response`](#validator)                                                  | Validate response bodies with Zod.                               | None                                             |
| [`comments`](#comments)                                                               | How much of each description reaches the JSDoc.                  | `'full'`                                         |
| [`sdk`](#sdk)                                                                         | Generate a class-based SDK instead of functions.                 | None                                             |
| ↳ [`sdk.mode`](#sdk)                                                                  | Generate one SDK class per tag or a flat SDK.                    | `'tag'`                                          |
| ↳ [`sdk.name`](#sdk)                                                                  | Name the composed or flat SDK class.                             | None                                             |
| [`returnType`](#returntype)                                                           | Shape of the value a generated call resolves to.                 | `'full'`                                         |
| [`include`](https://kubb.dev/docs/5.x/reference/plugin-options#include)               | Keep only operations that match.                                 | None                                             |
| [`exclude`](https://kubb.dev/docs/5.x/reference/plugin-options#exclude)               | Skip operations that match.                                      | `[]`                                             |
| [`override`](https://kubb.dev/docs/5.x/reference/plugin-options#override)             | Apply different options per pattern.                             | `[]`                                             |
| [`resolver`](#resolver)                                                               | Customize generated names and file paths.                        | `resolverClient`                                 |
| [`macros`](https://kubb.dev/docs/5.x/reference/plugin-options#macros)                 | Rewrite AST nodes before printing.                               | `[]`, run after the built-in client macros       |

## Option details

### baseURL

Base URL prepended to every request. When omitted, no host is prepended and each request uses the operation's relative path from the spec. A value containing a `${...}` interpolation is emitted as a template literal in the generated client config, so `baseURL: '${process.env.API_URL}'` reads the environment variable at runtime.

|          |          |
| -------- | -------- |
| Type     | `string` |
| Required | `false`  |

### throwOnErrorDefault

Set `throwOnErrorDefault: false` to return documented error responses as values by default. This sets the fallback on each generated request and the default `ThrowOnError` type parameter on standalone functions and SDK methods. A call with `throwOnError: true` still throws for a non-2xx response and narrows its return type to successful responses.

|          |           |
| -------- | --------- |
| Type     | `boolean` |
| Required | `false`   |
| Default  | `true`    |

```typescript
// pluginAxios({ throwOnErrorDefault: false }) or pluginFetch({ throwOnErrorDefault: false })
const result = await getPetById({ path: { petId: 1 } })
if (result.status !== 200) console.error(result.status, result.error)
```

This setting applies to the whole plugin and cannot be set in `override`. Pass `throwOnError` on a call to override it. Query hooks continue to set `throwOnError: true` explicitly.

### validator

Validates request and response bodies using schemas from `@kubb/plugin-zod`. Add `pluginZod()` when either direction uses `'zod'`. Invalid bodies cause the generated function to throw a `ParseError`.

|          |                                                           |
| -------- | --------------------------------------------------------- |
| Type     | `false \| 'zod' \| { request?: 'zod'; response?: 'zod' }` |
| Required | `false`                                                   |
| Default  | `false`                                                   |

::field-group

:::field{name="false"}
Default value. Does no validation and returns the response cast to the generated type.
:::

:::field{name="'zod'"}
Validates the success response body, and the error body when a non-2xx call does not throw.
:::

:::field{name="{ request?: 'zod', response?: 'zod' }"}
Opts in per direction, validating the request body before the call and the response body after.
:::

::

```typescript [kubb.config.ts]
import { defineConfig } from 'kubb/config'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { pluginFetch } from '@kubb/plugin-fetch'

export default defineConfig({
  input: './petStore.yaml',
  output: { path: './src/gen' },
  plugins: [
    pluginTs(),
    pluginZod(),
    pluginFetch({ validator: { request: 'zod', response: 'zod' } }),
  ],
})
```

### comments

Controls generated JSDoc.

|          |                               |
| -------- | ----------------------------- |
| Type     | `'full' \| 'brief' \| 'none'` |
| Required | `false`                       |
| Default  | `'full'`                      |

::field-group

:::field{name="'full'"}
Default value. Keeps complete descriptions and tags.
:::

:::field{name="'brief'"}
Keeps the first sentence and other tags. Descriptions over 150 characters without a sentence ending are cut at the last word before 120.
:::

:::field{name="'none'"}
Omits JSDoc but keeps the generated-by banner.
:::

::

### sdk

Generates a class-based SDK. Each instance receives a client configuration, so environments can use separate clients. Leave `sdk` unset to keep the standalone functions used by query plugins.

|          |                                             |
| -------- | ------------------------------------------- |
| Type     | `{ mode?: 'tag' \| 'flat'; name?: string }` |
| Required | `false`                                     |

::field-group

:::field{name="'tag'"}
Default value for `sdk.mode`. Generates one class per tag, such as `PetClient` and `StoreClient`. Set `sdk.name` to also generate a root class that instantiates the tag clients from one shared configuration, used as `new PetStore(config).pet.getPetById(...)`.
:::

:::field{name="'flat'"}
Generates a single class named by `sdk.name`, with every operation as a direct method. Supports single-file output.
:::

::

`mode: 'tag'` needs one file per tag, so pairing it with a single-file `output` (`output.mode: 'file'`, or an `output.path` that already names a file such as `'clients.ts'`) throws [`KUBB_INVALID_PLUGIN_OPTIONS`](https://kubb.dev/docs/5.x/reference/diagnostics#kubb-invalid-plugin-options). Use `mode: 'flat'` for a single-file SDK, or give `output.path` a directory so `mode: 'tag'` can split per tag.

Construct a class with a client config, then call a method with the grouped options object (`{ path, query, headers, body }`). Each call resolves to `{ status, data, error, contentType, request, response }`. With the default `throwOnErrorDefault: true`, a resolved call means the request succeeded and `data` is set. Pass `throwOnError: false` to get the discriminated union instead, keyed on the top-level `status`:

```typescript
import { PetClient } from './src/gen/clients/petClient'

const pet = new PetClient({ baseURL: 'https://petstore.swagger.io/v2' })
const { status, data, error } = await pet.getPetById({ path: { petId: 1 }, throwOnError: false })

if (status === 200) {
  console.log(data) // data is the success body, error is undefined
} else {
  console.error(status, error) // status is the documented error code, error is its parsed body
}
```

### returnType

Shape of the value a generated call resolves to.

|          |                    |
| -------- | ------------------ |
| Type     | `'full' \| 'data'` |
| Required | `false`            |
| Default  | `'full'`           |

::field-group

:::field{name="'full'"}
Default value. Returns `{ status, data, error, contentType, request, response }`.
:::

:::field{name="'data'"}
Returns the success body when `throwOnError` is `true`. With `throwOnError: false`, returns the full result so callers can distinguish errors from successful responses.
:::

::

```typescript
pluginFetch({ returnType: 'data' })

const pet = await getPetById({ path: { petId: 1 } }) // Pet, not { status, data, ... }
```

This applies to the standalone functions and the class-based SDK. `@kubb/plugin-react-query`, `@kubb/plugin-vue-query`, `@kubb/plugin-swr`, and `@kubb/plugin-mcp` read the same option, so their hooks and tool handlers give you the success body as `data` either way. They also honor a per-operation `returnType` set through [`override`](https://kubb.dev/docs/5.x/reference/plugin-options#override).

To read response headers such as `ETag` under `'data'`, pass `throwOnError: false` on the call. It then resolves to the full result, and a non-2xx comes back on `error` instead of throwing:

```typescript
const result = await getPetById({ path: { petId: 1 }, throwOnError: false })

if (result.error === undefined) {
  const etag = result.response.headers.get('etag')
}
```

### resolver

Overrides generated file and symbol names. Omitted members keep `resolverClient`. The shared members (`name`, `file`, `imports`) and the `this` context are described under [`resolver`](https://kubb.dev/docs/5.x/reference/plugin-options#resolver).

|          |                                 |
| -------- | ------------------------------- |
| Type     | `ResolverPatch<ResolverClient>` |
| Required | `false`                         |

```typescript [Partial override]
type ResolverClientPatch = {
  name?(name: string): string
  file?: {
    baseName?(params: { name: string; extname: string }): string
    path?(params: { baseName: string; output: Output }): string
  }
  imports?(options: ResolveImportsOptions): Array<ImportNode>
  className?(name: string): string
  groupName?(name: string): string     // → 'PetClient'
  propertyName?(name: string): string
}
```
