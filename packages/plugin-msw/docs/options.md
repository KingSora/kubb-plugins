# Options

Pass these options to `pluginMsw()`. Shared options link to [Shared plugin options](https://kubb.dev/docs/5.x/reference/plugin-options), which documents their behavior once.

## Options overview

| Option                                                                                | Purpose                                                | Default                                           |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| [`output`](https://kubb.dev/docs/5.x/reference/plugin-options#output)                 | Where the generated handlers are written and exported. | `{ path: 'handlers', barrel: { type: 'named' } }` |
| ↳ [`output.path`](https://kubb.dev/docs/5.x/reference/plugin-options#output-path)     | Choose the output folder or file.                      | `'handlers'`                                      |
| ↳ [`output.mode`](https://kubb.dev/docs/5.x/reference/plugin-options#output-mode)     | Write a single file or a directory of files.           | Inferred from `output.path`                       |
| ↳ [`output.barrel`](https://kubb.dev/docs/5.x/reference/plugin-options#output-barrel) | Configure barrel exports.                              | `{ type: 'named' }`                               |
| ↳ [`output.banner`](https://kubb.dev/docs/5.x/reference/plugin-options#output-banner) | Add content before generated code.                     | None                                              |
| ↳ [`output.footer`](https://kubb.dev/docs/5.x/reference/plugin-options#output-footer) | Add content after generated code.                      | None                                              |
| [`group`](https://kubb.dev/docs/5.x/reference/plugin-options#group)                   | Split output into per-tag or per-path folders.         | None                                              |
| ↳ [`group.type`](https://kubb.dev/docs/5.x/reference/plugin-options#group-type)       | Group operations by tag or URL path.                   | Required with `group`                             |
| ↳ [`group.name`](https://kubb.dev/docs/5.x/reference/plugin-options#group-name)       | Customize output group names.                          | camelCased tag or raw path segment                |
| [`baseURL`](#baseurl)                                                                 | Base URL prepended to every handler's request.         | None                                              |
| [`handlers`](#handlers)                                                               | Emit a `handlers.ts` that re-exports every handler.    | `false`                                           |
| [`parser`](#parser)                                                                   | Source of the response body each handler returns.      | `'data'`                                          |
| [`include`](https://kubb.dev/docs/5.x/reference/plugin-options#include)               | Keep only operations that match.                       | None                                              |
| [`exclude`](https://kubb.dev/docs/5.x/reference/plugin-options#exclude)               | Skip operations that match.                            | `[]`                                              |
| [`override`](https://kubb.dev/docs/5.x/reference/plugin-options#override)             | Apply different options per pattern.                   | `[]`                                              |
| [`resolver`](#resolver)                                                               | Customize generated names and file paths.              | `resolverMsw`                                     |
| [`macros`](https://kubb.dev/docs/5.x/reference/plugin-options#macros)                 | Rewrite AST nodes before printing.                     | `[]`                                              |

## Option details

### baseURL

Base URL prepended to every handler's request. When omitted, no host is prepended and each handler matches the operation's relative path from the spec. Set it to point at a different environment than the spec.

|          |          |
| -------- | -------- |
| Type     | `string` |
| Required | `false`  |

### handlers

Emits a `handlers.ts` file that re-exports every generated handler in operation order. Spread it into your MSW `setupServer(...handlers)` or `setupWorker(...handlers)` call.

|          |           |
| -------- | --------- |
| Type     | `boolean` |
| Required | `false`   |
| Default  | `false`   |

```typescript [gen/handlers.ts]
import { getPetHandler } from './getPetHandler'
import { addPetHandler } from './addPetHandler'

export const handlers = [getPetHandler(), addPetHandler()] as const
```

### parser

Source of the response body each handler returns.

|          |                     |
| -------- | ------------------- |
| Type     | `'data' \| 'faker'` |
| Required | `false`             |
| Default  | `'data'`            |

::field-group

:::field{name="'data'"}
Default value. Returns a typed payload from `@kubb/plugin-ts` that you supply in tests. The handler uses `new Response(JSON.stringify(data), ...)`.
:::

:::field{name="'faker'"}
Falls back to a value generated by `@kubb/plugin-faker` when no data is supplied. Register `pluginFaker()` alongside this plugin.
:::

::

```typescript ['faker']
export function getPetHandler(data?: GetPetQueryResponse | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Response | Promise<Response>)) {
  return http.get('/pet/:petId', function handler(info) {
    if (typeof data === 'function') return data(info)

    return new Response(JSON.stringify(data || createGetPetQueryResponse(data)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}
```

### resolver

Overrides generated file and symbol names. Omitted members keep `resolverMsw`. The shared members (`name`, `file`, `imports`) and the `this` context are described under [`resolver`](https://kubb.dev/docs/5.x/reference/plugin-options#resolver).

|          |                              |
| -------- | ---------------------------- |
| Type     | `ResolverPatch<ResolverMsw>` |
| Required | `false`                      |

```typescript [Partial override]
type ResolverMswPatch = {
  name?(name: string): string
  file?: {
    baseName?(params: { name: string; extname: string }): string
    path?(params: { baseName: string; output: Output }): string
  }
  imports?(options: ResolveImportsOptions): Array<ImportNode>
  handler?: {
    name?(node: OperationNode): string  // → 'getPetHandler'
    listName?(): string                 // → 'handlers'
  }
}
```
