---
'@kubb/plugin-faker': patch
---

Print `pattern` as a regex literal in `faker.helpers.fromRegExp(...)`. Backslashes, `^` and `$` anchors, and double quotes in the pattern now survive. Faker still does not support shorthand classes such as `\d`, so use `regexGenerator: 'randexp'` for those patterns.
