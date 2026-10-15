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

Ship separate CommonJS type declarations, so `require` consumers get correct types under `moduleResolution: node16` and `nodenext`.

- Points the `require` condition at new `.d.cts` files. It used to reuse the ESM `.d.ts`, which TypeScript then read as ESM.
- Removes the untyped `rolldown-runtime` import from the published declarations, which failed under `skipLibCheck: false`.
