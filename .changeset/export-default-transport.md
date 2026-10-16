---
'@kubb/plugin-fetch': minor
'@kubb/plugin-axios': minor
---

Export `defaultTransport` from the generated `.kubb/client.ts`.

With `@kubb/plugin-fetch`, wrap it in a custom transport to add tracing or other behavior and keep the built-in `fetch` send and response parsing:

```ts
import { client, defaultTransport } from './gen/.kubb/client'

client.setConfig({
  transport: (request) => withSpan(request, () => defaultTransport(request)),
})
```

With `@kubb/plugin-axios`, `defaultTransport` is the `axios.create()` instance the default `client` sends through. Add axios interceptors or defaults to it directly. `createClientCore` accepts a matching `defaultTransport` option.
