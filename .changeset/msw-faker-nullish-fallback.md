---
'@kubb/plugin-msw': patch
---

With `parser: 'faker'`, generated handlers now fall back to Faker data only when `data` is `undefined` or `null`. A falsy payload such as `0`, `false`, or `''` is returned as is, where before it was replaced with Faker data.

```typescript
// Before
return new Response(JSON.stringify(data || createGetPetByIdResponse(data)), {

// After
return new Response(JSON.stringify(data ?? createGetPetByIdResponse(data)), {
```
