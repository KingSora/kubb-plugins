---
'@kubb/plugin-fetch': minor
---

Export `defaultTransport` from the generated `.kubb/client.ts`. Wrap it in a custom transport to add tracing or other behavior and keep the built-in `fetch` send and response parsing.

```ts
import { client, defaultTransport } from './gen/.kubb/client'

client.setConfig({
  transport: (request) => withSpan(request, () => defaultTransport(request)),
})
```
