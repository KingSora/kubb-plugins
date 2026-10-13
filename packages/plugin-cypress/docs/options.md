# Options

Pass these options to `pluginCypress()`. Shared options link to [Shared plugin options](https://kubb.dev/docs/5.x/reference/plugin-options).

## Options overview

| Option                                                                    | Purpose                                                                | Default                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| [`output`](https://kubb.dev/docs/5.x/reference/plugin-options#output)     | Where files are written: `path`, `mode`, `barrel`, `banner`, `footer`. | `{ path: 'cypress', barrel: { type: 'named' } }` |
| [`group`](https://kubb.dev/docs/5.x/reference/plugin-options#group)       | Split output by tag or path: `type`, `name`.                           | None                                             |
| [`baseURL`](#baseurl)                                                     | Base URL prepended to every request.                                   | None                                             |
| [`include`](https://kubb.dev/docs/5.x/reference/plugin-options#include)   | Keep only operations that match.                                       | None                                             |
| [`exclude`](https://kubb.dev/docs/5.x/reference/plugin-options#exclude)   | Skip operations that match.                                            | `[]`                                             |
| [`override`](https://kubb.dev/docs/5.x/reference/plugin-options#override) | Apply different options per pattern.                                   | `[]`                                             |
| [`resolver`](https://kubb.dev/docs/5.x/reference/plugin-options#resolver) | Customize generated names and file paths.                              | `resolverCypress`                                |
| [`macros`](https://kubb.dev/docs/5.x/reference/plugin-options#macros)     | Rewrite AST nodes before printing.                                     | `[]`                                             |

`resolverCypress` adds no namespaces of its own, so a `resolver` patch uses only the shared `name`, `file` and `imports` members.

## Option details

### baseURL

Base URL prepended to every request in the generated helpers. When omitted, no host is prepended and each helper uses the operation's relative path from the spec. The host is emitted into each helper's URL, so no runtime host setup is needed.

|          |          |
| -------- | -------- |
| Type     | `string` |
| Required | `false`  |

```typescript [baseURL: 'https://staging.petstore.dev']
export function showPetById(
  { path }: ShowPetByIdOptions,
  options: Partial<Cypress.RequestOptions> = {},
): Cypress.Chainable<ShowPetByIdResponse> {
  return cy
    .request<ShowPetByIdResponse>({
      method: 'GET',
      url: `https://staging.petstore.dev/pets/${path.petId}`,
      ...options,
    })
    .then((res) => res.body)
}
```
