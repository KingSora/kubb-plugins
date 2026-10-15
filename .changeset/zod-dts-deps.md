---
'@kubb/plugin-zod': patch
---

Type the printer's `dateType` option with `ast.ParserOptions` from `kubb/kit`. The published types no longer import `@kubb/adapter-oas`, which this package doesn't depend on, so they resolve under pnpm and other strict installers.
