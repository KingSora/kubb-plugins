---
'@kubb/plugin-axios': patch
'@kubb/plugin-client': patch
'@kubb/plugin-faker': patch
'@kubb/plugin-fetch': patch
'@kubb/plugin-mcp': patch
'@kubb/plugin-msw': patch
'@kubb/plugin-react-query': patch
'@kubb/plugin-redoc': patch
'@kubb/plugin-swr': patch
'@kubb/plugin-vue-query': patch
'@kubb/plugin-zod': patch
---

Config mistakes now fail with a diagnostic code and a fix instead of a plugin crash. A client plugin without `pluginTs()` or `pluginZod({ inferred: true })` now fails instead of generating nothing.
