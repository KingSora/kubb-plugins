import { createQueryGenerator } from './createQueryGenerator.tsx'

/**
 * Built-in generator for `useSuspenseInfiniteQuery` hooks. Enabled when
 * `suspense`, `infinite`, and `hooks` are all configured. Combines suspense
 * semantics with cursor-based pagination. Handlers throw promises while
 * loading and pull additional pages on demand.
 */
export const suspenseInfiniteQueryGenerator = createQueryGenerator({ name: 'react-suspense-infinite-query', variant: 'suspenseInfiniteQuery' })
