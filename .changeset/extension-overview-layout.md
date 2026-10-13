---
'@kubb/plugin-axios': patch
'@kubb/plugin-client': patch
'@kubb/plugin-cypress': patch
'@kubb/plugin-faker': patch
'@kubb/plugin-fetch': patch
'@kubb/plugin-mcp': patch
'@kubb/plugin-msw': patch
'@kubb/plugin-react-query': patch
'@kubb/plugin-redoc': patch
'@kubb/plugin-swr': patch
'@kubb/plugin-ts': patch
'@kubb/plugin-vue-query': patch
'@kubb/plugin-zod': patch
---

Give each extension page on kubb.dev the same sections (Setup, Options worth knowing, Example, and See also), and fix claims that did not match the code.

- List the peer versions the generated code needs, such as `@tanstack/react-query` 5.82, `swr` 2.2, `@faker-js/faker` v10, and `cypress` v15 or v16.
- Say that `validator: 'zod'` validates response bodies only, and that `{ request: 'zod', response: 'zod' }` also validates request bodies.
- Say which React Query and Vue Query options need `hooks: true`.
- Say that the MCP server starts through `startServer()` and that the generated `.mcp.json` runs `npx tsx`.
