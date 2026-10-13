---
"@kubb/plugin-msw": patch
"@kubb/plugin-client": patch
"@kubb/plugin-axios": patch
"@kubb/plugin-fetch": patch
---

List `optionalDependencies` in `kubb-extension.json`: `plugin-faker` for `@kubb/plugin-msw` (needed with `parser: 'faker'`), and `plugin-zod` for the client plugins (used when it is in the config, and needed by `@kubb/plugin-client` with `validator`).
