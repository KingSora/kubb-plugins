---
'@kubb/plugin-mcp': patch
---

Generate a `start.ts` entry that calls `startServer()`, and point the generated `.mcp.json` at it, so the server starts over stdio without an entry file of your own. The `.mcp.json` path is now relative to the Kubb `root`, where MCP clients such as Claude Code start the command, instead of the `.mcp.json` folder.

```jsonc
// Before
"args": ["tsx", "server.ts"]
// After
"args": ["tsx", "./src/gen/mcp/start.ts"]
```
