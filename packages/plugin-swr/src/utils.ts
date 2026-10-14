import type { ast } from 'kubb/kit'
import type { ResolverTs } from '@kubb/plugin-ts'
import { resolveErrorNames, resolveSuccessNames } from '@internals/shared'

export { buildQueryKeyParams } from '@internals/tanstack-query'
export { buildClientOptionType, buildOperationComments as getComments, buildRequestConfigType } from '@internals/shared'

/**
 * The `TData` and `TError` type arguments of an operation's hook: the success names as a union (or the
 * response type) and the error names wrapped in `ResponseErrorConfig`.
 */
export function buildResponseTypes(node: ast.OperationNode, resolver: ResolverTs): { TData: string; TError: string } {
  const successNames = resolveSuccessNames(node, resolver)
  const errorNames = resolveErrorNames(node, resolver)

  return {
    TData: successNames.length > 0 ? successNames.join(' | ') : resolver.response.response(node),
    TError: `ResponseErrorConfig<${errorNames.length > 0 ? errorNames.join(' | ') : 'Error'}>`,
  }
}
