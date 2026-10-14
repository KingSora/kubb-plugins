import { createQueryGenerator } from './createQueryGenerator.tsx'

/**
 * Built-in generator for `useSuspenseQuery` hooks. Enabled when
 * `pluginReactQuery({ suspense: {}, hooks: true })`. Emits one
 * `useFooSuspenseQuery` hook per query operation. Suspense queries throw
 * promises while loading and require a `<Suspense>` boundary in the React
 * tree. TanStack Query v5+ only.
 */
export const suspenseQueryGenerator = createQueryGenerator({ name: 'react-suspense-query', variant: 'suspenseQuery' })
