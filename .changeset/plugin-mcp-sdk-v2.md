---
'@kubb/plugin-mcp': minor
---

Generate MCP servers for the MCP TypeScript SDK v2 (`@modelcontextprotocol/server`).

- Import `McpServer`, `ServerContext`, and `CallToolResult` from `@modelcontextprotocol/server`.
- Pass `ctx: ServerContext` to each handler and forward `ctx.mcpReq.signal` to the client call.
- Wrap `inputSchema` and `outputSchema` in `z.object()`, since v2 deprecates raw shapes.
- Start the stdio server with `serveStdio(getServer)`, which also serves clients on the 2025 protocol. `startServer()` now resolves to the stdio handle, so `close()` stops the server, and it logs transport errors to stderr. It builds its own servers from `getServer()`, so tools registered on the exported `server` are not served.
- Named barrels now export `getServer`, `server`, and `startServer`, instead of only `server`.
- Replace the `@modelcontextprotocol/sdk ^1.0.0` peer with `@modelcontextprotocol/server ^2.0.0`, and raise the `zod` peer to `^4.2.0`.

```typescript
// Before
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { CallToolResult, ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js'

export async function getPetByIdHandler({ path }: GetPetByIdOptions, request: RequestHandlerExtra<ServerRequest, ServerNotification>): Promise<CallToolResult> {
  const res = await getPetById({ path, signal: request.signal, throwOnError: true })
  // ...
}

// After
import type { CallToolResult, ServerContext } from '@modelcontextprotocol/server'

export async function getPetByIdHandler({ path }: GetPetByIdOptions, ctx: ServerContext): Promise<CallToolResult> {
  const res = await getPetById({ path, signal: ctx.mcpReq.signal, throwOnError: true })
  // ...
}
```

To upgrade, uninstall `@modelcontextprotocol/sdk`, install `@modelcontextprotocol/server@^2` and `zod@^4.2`, and run `kubb generate`. To serve over HTTP, pass the generated `getServer` to `createMcpHandler(getServer)`.
