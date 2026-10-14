import { createQueryGenerator } from './createQueryGenerator.tsx'

/**
 * Built-in generator for `useQuery` hooks. Emits one `useFooQuery` hook per
 * GET and QUERY operation (configurable via `query.methods`) plus the matching
 * `fooQueryKey` / `fooQueryOptions` helpers.
 */
export const queryGenerator = createQueryGenerator({ name: 'react-query', variant: 'query' })
