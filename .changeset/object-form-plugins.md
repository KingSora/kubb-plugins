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

Define every plugin with the object form of `definePlugin`. Each plugin now carries `meta` with its name and package version, and `setup` returns its resolved options.

Required plugins move from `ctx.requirePlugin` to a `dependencies` record. A config without a required plugin now fails before any plugin runs, with `KUBB_MISSING_DEPENDENCY` instead of `KUBB_PLUGIN_NOT_FOUND`. The rules for which plugin needs which stay the same:

- cypress, faker, mcp, msw, react-query, swr, and vue-query need `@kubb/plugin-ts`.
- mcp needs `@kubb/plugin-zod`, and msw needs `@kubb/plugin-faker` when `parser: 'faker'` is set.
- client needs `@kubb/plugin-zod` when `validator` is set. axios, fetch, and client only order themselves after plugin-ts and plugin-zod.

Every plugin now requires Kubb 5.7.0 or newer, because the object form of `definePlugin` ships in that release. `meta.compatibility.kubb` is `>=5.7.0`, and the `kubb` and `@kubb/*` peer ranges move to `^5.7.0`.
