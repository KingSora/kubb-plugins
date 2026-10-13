---
'@kubb/plugin-swr': patch
---

Raise the `swr` peer range from `^2.0.0` to `^2.2.0`. Generated mutation hooks type their options as `SWRMutationConfiguration<Data, Error, Key, Arg>`, the generic order SWR uses from 2.2.0. SWR 2.0.0 to 2.1.5 declare `<Data, Error, ExtraArg, Key>`, so the output failed to compile against them.
