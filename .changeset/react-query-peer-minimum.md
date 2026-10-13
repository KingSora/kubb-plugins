---
'@kubb/plugin-react-query': patch
---

Raise the `@tanstack/react-query` peer range from `^5.0.0` to `^5.82.0`. Generated mutation files import `mutationOptions`, which `@tanstack/react-query` first exports in 5.82.0, so older 5.x versions failed to compile the output.
