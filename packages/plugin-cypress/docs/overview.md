# Cypress

Generates a typed `cy.request()` helper for each operation in your OpenAPI spec. Your Cypress tests call the API through these helpers, so a broken call fails at compile time instead of at run time.

Each helper takes grouped `path`, `query`, `headers`, and `body` parameters named after the spec. It returns the response body typed as `Cypress.Chainable<{Operation}Response>`.

## Setup

- Add `@kubb/plugin-ts` for the request and response types.
- The generated helpers need Cypress v13 or higher.

## Options worth knowing

- `baseURL` is prepended to every request.

## Example

```typescript [kubb.config.ts]
import { defineConfig } from 'kubb/config'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginCypress } from '@kubb/plugin-cypress'

export default defineConfig({
  input: './petStore.yaml',
  output: { path: './src/gen' },
  plugins: [
    pluginTs(),
    pluginCypress({ output: { path: 'cypress', mode: 'directory' } }),
  ],
})
```

```typescript [pet.cy.ts]
import { getPetById } from '../src/gen/cypress/getPetById'

describe('Pet API', () => {
  it('returns the pet by id', () => {
    getPetById({ path: { petId: 1n } }).then((pet) => {
      expect(pet.id).to.eq(1n)
    })
  })
})
```

## See also

- [Cypress](https://www.cypress.io/)
- [cy.request()](https://docs.cypress.io/api/commands/request)
- [@kubb/plugin-ts](https://kubb.dev/extensions/kubb-labs/plugin-ts)
