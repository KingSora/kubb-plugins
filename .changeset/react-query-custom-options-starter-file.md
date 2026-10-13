---
'@kubb/plugin-react-query': patch
---

The `customOptions` starter file is only created when `hooks: true`. Before, it was also written with `hooks: false`, where it imported a `HookOptions` type that is not generated.

The starter file is also only created when `customOptions.importPath` resolves inside the plugin's output folder. An `importPath` such as `'../../useCustomHookOptions'` no longer writes a file outside it. Create that module yourself.
