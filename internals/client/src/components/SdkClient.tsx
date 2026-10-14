import { buildOperationComments } from '@internals/shared'
import { buildJSDoc } from '@internals/utils'
import { ast } from 'kubb/kit'
import type { ResolverZod } from '@kubb/plugin-zod'
import { File } from 'kubb/jsx'
import type { KubbReactNode } from 'kubb/jsx'
import { buildContentType } from '../builders/contentType.ts'
import { buildReturnStatement } from '../builders/returnStatement.ts'
import { type Auth, buildSecurityMetadata } from '../builders/security.ts'
import { buildGroupedOptionsSignature } from '../builders/signature.ts'
import { buildValidatorHooks } from '../builders/validator.ts'
import type { OperationTypeNames } from '../resolveOperationTypes.ts'
import type { ReturnTypeOption, ValidatorOptions } from '../types.ts'

/**
 * Builds the call config literal forwarded to the contract client, mirroring the shared `Operation`
 * component: `{ method, url, security?, validator?, ...config }`. The `...config` spread carries every
 * per-call field. The plugin's `throwOnError` fallback is applied after the spread so it also wins
 * over a client instance's runtime config when the call omits an override.
 */
function buildCallConfig({
  node,
  validator,
  zodResolver,
  security,
  throwOnErrorDefault,
}: {
  node: ast.HttpOperationNode
  validator: ValidatorOptions | undefined
  zodResolver?: ResolverZod | null
  security?: Array<Auth>
  throwOnErrorDefault: boolean
}): string {
  const validators = buildValidatorHooks({ node, validator, zodResolver })
  const validatorEntries = [
    validators.request ? `request: ${validators.request}` : null,
    validators.response ? `response: ${validators.response}` : null,
  ].filter(Boolean)
  const validatorLiteral = validatorEntries.length ? `validator: { ${validatorEntries.join(', ')} }` : null
  const securityLiteral = buildSecurityMetadata({ security })
  const { literal: contentTypeLiteral } = buildContentType({ node })

  return `{ ${[
    `method: '${node.method.toUpperCase()}'`,
    `url: '${node.path}'`,
    securityLiteral ? `security: ${securityLiteral}` : null,
    validatorLiteral,
    contentTypeLiteral,
    '...config',
    `throwOnError: config.throwOnError ?? ${throwOnErrorDefault}`,
  ]
    .filter(Boolean)
    .join(', ')} }`
}

/**
 * Builds a single instance method for a generated SDK class. The body forwards the single grouped
 * `options` object to the instance's own client (`this.client`, built once in the constructor) and
 * returns the `Unwrappable<RequestResult>`. A per-call `options.client` still overrides the
 * instance client, so one operation can be routed to a different environment without a new
 * instance.
 */
export function buildSdkMethod({
  node,
  name,
  types,
  zodResolver,
  validator,
  security,
  returnType,
  throwOnErrorDefault,
}: {
  node: ast.OperationNode
  name: string
  types: OperationTypeNames
  zodResolver?: ResolverZod | null
  validator: ValidatorOptions | undefined
  security?: Array<Auth>
  returnType: ReturnTypeOption
  throwOnErrorDefault: boolean
}): string {
  if (!ast.isHttpOperationNode(node)) return ''

  const signature = buildGroupedOptionsSignature({ node, types, returnType, throwOnErrorDefault })
  const callConfig = buildCallConfig({ node, validator, zodResolver, security, throwOnErrorDefault })
  const returnStatement = buildReturnStatement({ node, types, callConfig, returnType, throwOnErrorDefault })
  const generics = signature.generics.length ? `<${signature.generics.join(', ')}>` : ''
  const jsdoc = buildJSDoc(buildOperationComments(node, { link: 'urlPath', linkPosition: 'beforeDeprecated', splitLines: true }))

  const destructure = buildContentType({ node }).merge
    ? 'const { client: request = this.client, contentType, ...config } = options'
    : 'const { client: request = this.client, ...config } = options'
  const methodBody = [destructure, '', returnStatement].map((line) => (line ? `    ${line}` : '')).join('\n')

  return `${jsdoc}  public ${name}${generics}(${signature.paramsSignature}): ${signature.returnType} {\n${methodBody}\n  }`
}

type OperationData = {
  node: ast.OperationNode
  name: string
  types: OperationTypeNames
  zodResolver?: ResolverZod | null
  security?: Array<Auth>
}

type Props = {
  name: string
  operations: Array<OperationData>
  validator: ValidatorOptions | undefined
  returnType: ReturnTypeOption
  throwOnErrorDefault: boolean
}

/**
 * Renders one instance class per tag with one method per operation. The constructor takes a client
 * config object and builds its own client through `createClient`, so each environment is a separate
 * instance: `const api = new PetClient({ baseURL }); api.getPetById(...)`. A per-call `client` option
 * still overrides the instance client for a one-off call.
 */
export function SdkClient({ name, operations, validator, returnType, throwOnErrorDefault }: Props): KubbReactNode {
  const methods = operations.map(({ node, name: methodName, types, zodResolver, security }) =>
    buildSdkMethod({
      node,
      name: methodName,
      types,
      zodResolver,
      validator,
      security,
      returnType,
      throwOnErrorDefault,
    }),
  )

  const constructor = [
    '  private readonly client: ClientInstance',
    '',
    '  constructor(config: ClientConfig = {}) {',
    '    this.client = createClient(config)',
    '  }',
  ].join('\n')

  const classCode = `export class ${name} {\n${constructor}\n\n${methods.join('\n\n')}\n}`

  return (
    <File.Source name={name} isExportable isIndexable>
      {classCode}
    </File.Source>
  )
}
