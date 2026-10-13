---
'@kubb/plugin-msw': patch
---

The registry metadata no longer lists `@kubb/plugin-faker` as a required dependency. The plugin needs it only with `parser: 'faker'`. The `parser: 'faker'` docs now say the Faker fallback runs only when `data` is `undefined` or `null`, which matches the generated `data ?? factory(data)`.
