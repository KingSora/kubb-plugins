---
'@kubb/plugin-vue-query': patch
---

Raise the `@tanstack/vue-query` peer range from `^5.0.0` to `^5.41.0` and add `vue` `>=3.3.0` as an optional peer. Generated code imports `queryOptions` (first in `@tanstack/vue-query` 5.4.0), `infiniteQueryOptions` (first in 5.41.0), and `toValue` and `MaybeRefOrGetter` from `vue` (first in Vue 3.3), so older versions failed to compile the output.
