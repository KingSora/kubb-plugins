# Add interceptors

Register handlers on `client.interceptors.request`, `.response`, or `.error` to apply behavior across calls. Handlers receive native Axios objects.

## Run before the send

Request handlers run after URL construction, serialization, and authentication. Return the modified request:

```typescript
import { client } from './gen/.kubb/client'

client.interceptors.request.use((request) => {
  request.headers.set('X-Request-ID', crypto.randomUUID())
  return request
})
```

The handler receives an `InternalAxiosRequestConfig`, so headers go through `AxiosHeaders` and the
body is on `data`.

## Run after the send

Response handlers run before calls resolve. The handler receives an `AxiosResponse`:

```typescript
client.interceptors.response.use((response) => {
  console.info(`${response.status} ${response.config.url}`)
  return response
})
```

## React to an error

Use an error handler to react to HTTP errors on the throwing path. The handler receives an
`AxiosError`:

```typescript
client.interceptors.error.use((error) => {
  if (error.response?.status === 401) scheduleTokenRefresh()
  return error
})
```

This channel only fires on the throw path. When you read with `throwOnError: false`, a documented
non-2xx response resolves and no error interceptor runs, so inspect the returned `error` on the
result instead. A transport failure (no response) still throws, and the error handler runs for it.

## Add, replace, and remove handlers

`use` registers a handler and returns an id. Pass that id to `eject` to remove it, or to `update`
to swap its function in place.

> [!NOTE]
> Response and error handlers run in the order you register them. Axios runs request handlers in
> reverse order.

```typescript
const id = client.interceptors.request.use((request) => request)

client.interceptors.request.update(id, (request) => {
  request.headers.set('X-Trace', 'on')
  return request
})

client.interceptors.request.eject(id)
```

## Where to set them

Register handlers on the shared `client` for all operations, or on a separate `createClient` instance for isolated calls. Interceptors are instance-level settings.

Interceptors registered through `client.interceptors` also follow a custom transport set later with
`client.setConfig({ transport })`. When the transport changes, handlers detach from the old
instance and attach to the new one, and their IDs stay valid for `eject` and `update`. Clearing the
transport (`client.setConfig({ transport: undefined })`) moves them back to the client's base
instance. A per-call `transport` still bypasses client interceptors.
