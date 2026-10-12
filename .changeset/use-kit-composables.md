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

Set up each plugin with the `kubb/kit` composables, such as `addGenerator()`, `setOptions()`, and `requirePlugin()`, instead of the `ctx` argument. The generated code is unchanged. These plugins now need Kubb 5.7.0 or later.
