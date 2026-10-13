# Use a custom transport

Set a transport at runtime to replace the network send. The client still builds URLs, serializes parameters, resolves authentication, and handles results.

The transport is an `AxiosInstance`. The default is `axios.create()`, and you can replace it with your own pre-configured instance. Use interceptors for request headers or response logging.

```typescript
type ClientConfig = {
  // ...
  transport?: AxiosInstance
}
```

Kubb forwards the resolved URL, query, body, and authentication to the instance.

## Pass a pre-configured instance

Give the client an instance with a timeout, default headers, and a logging interceptor:

```typescript
import axios from 'axios'
import { client } from './gen/.kubb/client'

const instance = axios.create({
  timeout: 10_000,
  headers: { 'X-Client': 'kubb' },
})

instance.interceptors.response.use((response) => {
  console.info(`${response.config.method?.toUpperCase()} ${response.config.url} -> ${response.status}`)
  return response
})

client.setConfig({ transport: instance })
```

Every generated function now sends through your instance, so its timeout, headers, and interceptors apply to each call. Interceptors registered through `client.interceptors` move to the new instance and keep their IDs for `eject` and `update`.

> [!NOTE]
> Kubb sets `transformRequest`, `paramsSerializer`, and `validateStatus` on each request for its own serialization and `throwOnError` handling, so leave those fields alone. Set timeouts, retries, and interceptors on the instance. For one call, pass `options`, such as `{ timeout }` or `{ onUploadProgress }`, instead of building a new instance.

## Where to set it

Use `client.setConfig({ transport })` for shared configuration, `createClient({ transport })` for an isolated instance, or pass `transport` on an operation to override it for one call.

## See also

- [Add interceptors](https://kubb.dev/extensions/kubb-labs/plugin-axios/guides/interceptors)
- [Set the base URL](https://kubb.dev/extensions/kubb-labs/plugin-axios/guides/base-url)
- [Call operations](https://kubb.dev/extensions/kubb-labs/plugin-axios/guides/calling-operations)
