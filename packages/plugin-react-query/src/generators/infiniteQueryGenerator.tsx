import { createQueryGenerator } from './createQueryGenerator.tsx'

/**
 * Built-in generator for `useInfiniteQuery` hooks. Enabled when
 * `pluginReactQuery({ infinite: { ... }, hooks: true })`. Emits one
 * `useFooInfiniteQuery` hook per query operation, wiring the configured
 * `nextParam` / `previousParam` paths into TanStack Query's cursor-based
 * pagination.
 */
export const infiniteQueryGenerator = createQueryGenerator({ name: 'react-infinite-query', variant: 'infiniteQuery' })
