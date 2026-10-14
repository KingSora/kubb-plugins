---
'@kubb/plugin-fetch': minor
'@kubb/plugin-axios': minor
'@kubb/plugin-msw': minor
'@kubb/plugin-react-query': minor
'@kubb/plugin-vue-query': minor
'@kubb/plugin-swr': minor
---

Support operations using the HTTP QUERY method (RFC 10008), which `@kubb/adapter-oas` parses from the OpenAPI 3.2 `query` field.

- `@kubb/plugin-fetch` and `@kubb/plugin-axios`: `RequestConfig['method']` accepts `'QUERY'`.
- `@kubb/plugin-react-query`, `@kubb/plugin-vue-query` and `@kubb/plugin-swr`: `query.methods` defaults to `['GET', 'QUERY']`, so a QUERY operation gets query hooks keyed by its body, like a GET.
- `@kubb/plugin-msw`: MSW has no `http.query`, so a QUERY handler is registered with `http.all` and answers only QUERY requests, letting other methods on the same path pass through.
