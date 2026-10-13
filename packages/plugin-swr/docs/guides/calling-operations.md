# Call operations

`@kubb/plugin-swr` turns each operation into an SWR hook that wraps the client function from `@kubb/plugin-axios` or `@kubb/plugin-fetch`. Read operations become `useFoo` with `useSWR`, write operations become `useFoo` with `useSWRMutation`, and every hook is typed from the spec.

## Queries

A query hook takes the operation's grouped request config (`path`, `query`, `headers`, whichever the operation declares) as its first argument:

```typescript
import { useGetPetById } from './gen/hooks/useGetPetById'

const { data, error, isLoading } = useGetPetById({ path: { petId: 1n } })
```

The second argument holds the SWR configuration plus two Kubb switches, `shouldFetch` and `immutable`, explained below. `query` takes any `SWRConfiguration` and `client` takes per-call request config for the underlying client:

```typescript
import { useGetPetById } from './gen/hooks/useGetPetById'

useGetPetById(
  { path: { petId: 1n } },
  {
    query: { refreshInterval: 30_000 },
    client: { baseURL: 'https://api.example.com/v1' },
  },
)
```

The exported `queryKey` helper includes the operation URL and request parameters. Use it with `mutate` to target cache updates.

## Mutations

A mutation hook takes only an options object. The grouped request config travels through `trigger(...)` as the mutation argument:

```typescript
import { mutate } from 'swr'
import { useCreatePet } from './gen/hooks/useCreatePet'
import { getPetsQueryKey } from './gen/hooks/useGetPets'

const { trigger, isMutating } = useCreatePet({
  mutation: { onSuccess: () => mutate(getPetsQueryKey()) },
})

await trigger({ body: { name: 'Fluffy' } })
```

A `mutationKey` helper is exported next to the hook.

## Errors and transport

The generated hooks call the client operation with `throwOnError: true`, so failures surface through the query library's `error` state, typed from the spec's error responses. Transport concerns (base URL, authentication, interceptors, serialization, validation) live on the client plugin: see the [plugin-fetch](https://kubb.dev/extensions/kubb-labs/plugin-fetch) or [plugin-axios](https://kubb.dev/extensions/kubb-labs/plugin-axios) guides.

## Skip requests until ready

Set `shouldFetch: false` to give SWR a `null` key and skip the request. Enable it once the required parameters are available. Mutation hooks accept the same switch, and a `null` key stops `trigger` from firing.

```typescript [usage.ts]
import { useGetPetById } from './gen/hooks/useGetPetById'

export function useSelectedPet(petId: bigint | undefined) {
  return useGetPetById(
    { path: { petId: petId ?? 0n } },
    { shouldFetch: petId != null },
  )
}
```

## Fetch immutable data

Set `immutable: true` on a query hook for data that stays unchanged. It sets `revalidateIfStale`, `revalidateOnFocus`, and `revalidateOnReconnect` to `false`.

```typescript [usage.ts]
import { useGetPetById } from './gen/hooks/useGetPetById'

const { data, error } = useGetPetById(
  { path: { petId: 1n } },
  { immutable: true },
)
```

Options in `query` override these revalidation defaults.
