# MCP

The MCP plugin turns each operation into a typed MCP tool that AI assistants can call. Each tool uses Zod schemas from `@kubb/plugin-zod` for its input and output.

Each tool handler calls the function a client plugin generates for that operation. The plugin writes `server.ts` and `.mcp.json` at the root of its `output.path`. `server.ts` exports `startServer()`, which you call from your own entry file to start a stdio server.

## Setup

- Add `@kubb/plugin-ts`, `@kubb/plugin-zod`, and a client plugin: `@kubb/plugin-fetch` or `@kubb/plugin-axios`. Leave `sdk` unset on the client plugin.
- Install `@modelcontextprotocol/server` v2 and `zod` 4.2 or a later v4 release in the app that runs the server. Add `axios` too when you use `@kubb/plugin-axios`.
- Install a TypeScript runner such as `tsx`. The generated `.mcp.json` runs `npx tsx`, which downloads `tsx` from npm when it is missing.

## Options worth knowing

- `client` picks `fetch` or `axios` when both client plugins are registered. A single client is detected automatically.
- `output.path` must be a folder name, such as the default `mcp`, because single-file output has no place for `server.ts` and `.mcp.json`.

The generated `.mcp.json` is a starting point. Point its command at your entry file, and move the file to where your MCP client reads it.

See [Options](https://kubb.dev/extensions/kubb-labs/plugin-mcp/options) for every option and its default.

## Example

The config below generates an MCP server whose tools call the Petstore API through `@kubb/plugin-fetch`.

```typescript [kubb.config.ts]
import { defineConfig } from 'kubb/config'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { pluginFetch } from '@kubb/plugin-fetch'
import { pluginMcp } from '@kubb/plugin-mcp'

export default defineConfig({
  input: './petStore.yaml',
  output: { path: './src/gen' },
  plugins: [
    pluginTs(),
    pluginZod(),
    pluginFetch({ baseURL: 'https://petstore.swagger.io/v2' }),
    pluginMcp({ output: { path: 'mcp', mode: 'directory' } }),
  ],
})
```
