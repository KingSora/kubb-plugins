---
'@kubb/plugin-redoc': patch
---

Escape the OpenAPI spec before inlining it in the generated HTML page. `<`, `>`, `&`, U+2028, and U+2029 in the JSON are written as `\uXXXX` escapes, so a spec string such as `</script><script>alert(1)</script>` in a description or example stays inside the data instead of closing the `<script>` tag.

The page now loads Redoc 2.5.4 from `https://cdn.jsdelivr.net/npm/redoc@2.5.4/bundles/redoc.standalone.js` with a Subresource Integrity hash, instead of the unpinned `https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js`.
