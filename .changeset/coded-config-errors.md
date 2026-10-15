---
'@kubb/plugin-axios': patch
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

Config mistakes now fail with a diagnostic code and a fix instead of a generic plugin crash.

- A missing or ambiguous client plugin in `@kubb/plugin-react-query`, `@kubb/plugin-vue-query`, `@kubb/plugin-swr`, and `@kubb/plugin-mcp` reports `KUBB_MISSING_DEPENDENCY` or `KUBB_INVALID_PLUGIN_OPTIONS`.
- `@kubb/plugin-redoc` and `@kubb/plugin-zod` report `KUBB_ADAPTER_REQUIRED` when the config does not use `adapterOas()`.
- `@kubb/plugin-fetch` and `@kubb/plugin-axios` require `@kubb/plugin-zod` when `validator` is set.
- `@kubb/plugin-fetch`, `@kubb/plugin-axios`, and `@kubb/plugin-client` now fail with `KUBB_MISSING_DEPENDENCY` when neither `pluginTs()` nor `pluginZod({ inferred: true })` is registered. Before, they skipped every operation with a warning.
- `@kubb/plugin-faker` reports `KUBB_INVALID_PLUGIN_OPTIONS` with the schema name when `dateParser` meets `adapterOas({ dateType: 'date' })`.
- Unknown values for `guidType` and `regexType` (zod), `typeMode` and `regexGenerator` (faker), `parser` (msw), and `returnType` and `sdk.mode` (fetch, axios) fail with `KUBB_INVALID_PLUGIN_OPTIONS`.
