---
'@kubb/plugin-fetch': minor
'@kubb/plugin-axios': minor
---

Add `validator.params: 'zod'` to encode and validate path, query, and header params before a request is sent.

- **Params validation:** each group runs through its generated `<operation>PathSchema` / `QuerySchema` / `HeadersSchema`, the same way `validator.request` runs the body. A codec param such as a `Date` goes out in its wire form (`/events/2026-10-01`), and an invalid param fails before the call. What a validator returns is exactly what is sent, so a value `onValidationError` replaces or a key the schema drops stays that way.
- **Header casing:** client-level `config.headers` and the call's headers are merged into one set with one key per header, matched case-insensitively, the call winning. The generated call wraps the headers schema in `toHeadersStandardSchema(schema, schema.shape)` from `.kubb/standardSchema.ts`, which matches declared headers in any casing, keeps the caller's casing, and passes undeclared headers such as `Authorization` or tracing headers through untouched. It only needs a Standard Schema plus the object's declared keys, so it also fits other libraries (`schema.entries` for valibot).
- **Header styles on client headers:** since client and call headers are merged before styling, a non-string client header value (array, object, or `Date`) named like a header param with `style`/`explode` metadata is now serialized in that param's style (`['a', 'b']` becomes `a,b`) instead of `JSON.stringify` (`["a","b"]`), the same as on the call.
- **Auth after validation:** query and header values added by `auth` are applied after validation and never pass through a schema.
- **Type change, `ValidationErrorContext.source`:** a new required field (`'body' | 'path' | 'query' | 'headers'`) tells `onValidationError` which part failed: `'body'` for request, response, and error bodies, or one of the param groups. Code that constructs a `ValidationErrorContext` itself must now set it.
- **Type change, `client.getUrl`:** it takes a `UrlConfig` (`baseURL`, `url`, `path`, `query`, `params`, `serializer`, `styles`) instead of a full `RequestConfig`, since it never runs validators. Passing other fields, such as `validator`, in an object literal is now a type error.

With `pluginZod({ inferred: 'direction' })`, request types take the domain value (a `Date`) that these validators encode, so enable `validator: { request: 'zod', params: 'zod' }` alongside it.

```typescript
pluginZod({ inferred: 'direction' })
pluginFetch({ validator: { request: 'zod', params: 'zod', response: 'zod' } })

await putEvent({
  path: { day: new Date('2026-10-01') }, // PUT /events/2026-10-01
  query: { after: new Date() },
  body: { startsAt: new Date() },
})
```
