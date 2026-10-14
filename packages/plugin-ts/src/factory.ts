import { createRequire } from 'node:module'
import { camelCase, pascalCase, screamingSnakeCase, snakeCase } from '@internals/utils'
import { syncSchemaRef } from 'kubb/kit'
import type { ast } from 'kubb/kit'
import type ts from 'typescript'
import { OPTIONAL_ADDS_UNDEFINED } from './constants.ts'

/**
 * Loaded with `require`, not `import`. When ESM imports a CommonJS package, Node keeps a second
 * copy of its source to detect named exports, and for TypeScript that copy is about 9 MB.
 */
const typescript: typeof ts = createRequire(import.meta.url)('typescript')

const { SyntaxKind, factory } = typescript

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

// https://ts-ast-viewer.com/

/**
 * TypeScript AST modifiers for the `export` keyword.
 */
export const modifiers = {
  export: factory.createModifier(typescript.SyntaxKind.ExportKeyword),
} as const

export const isUnionTypeNode = typescript.isUnionTypeNode

export function isNonNullable<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

function isValidIdentifier(str: string): boolean {
  if (!str.length || str.trim() !== str) {
    return false
  }

  // Mirrors `typescript.isIdentifierText`, which is not in the public type declarations.
  // Walking by code point with `isIdentifierStart`/`isIdentifierPart` rejects
  // invalid names such as private identifiers (`#FOO`), forcing `propertyName`
  // to quote them.
  let ch = str.codePointAt(0)!
  if (!typescript.isIdentifierStart(ch, typescript.ScriptTarget.Latest)) {
    return false
  }
  for (let i = ch > 0xffff ? 2 : 1; i < str.length; i += ch > 0xffff ? 2 : 1) {
    ch = str.codePointAt(i)!
    if (!typescript.isIdentifierPart(ch, typescript.ScriptTarget.Latest)) {
      return false
    }
  }
  return true
}

function propertyName(name: string | ts.PropertyName): ts.PropertyName {
  if (typeof name === 'string') {
    const isValid = isValidIdentifier(name)
    return isValid ? factory.createIdentifier(name) : factory.createStringLiteral(name)
  }
  return name
}

const questionToken = factory.createToken(typescript.SyntaxKind.QuestionToken)

/**
 * Creates a question token for optional type annotations.
 * Pass `true` to use the cached token, or provide a pre-created token.
 */
function createQuestionToken(token?: boolean | ts.QuestionToken) {
  if (!token) {
    return undefined
  }
  if (token === true) {
    return questionToken
  }
  return token
}

/**
 * Creates a TypeScript intersection type node from multiple type nodes.
 * Returns the single node if only one is provided, or wraps in parentheses if requested.
 */
export function createIntersectionDeclaration({ nodes, withParentheses }: { nodes: Array<ts.TypeNode>; withParentheses?: boolean }): ts.TypeNode | null {
  if (!nodes.length) {
    return null
  }

  if (nodes.length === 1) {
    return nodes[0] || null
  }

  const node = factory.createIntersectionTypeNode(nodes)

  if (withParentheses) {
    return factory.createParenthesizedType(node)
  }

  return node
}

/**
 * Creates a TypeScript array type node.
 * Use `arrayType: 'array'` for bracket syntax (`T[]`), or `'generic'` for `Array<T>`.
 *
 * @example Array bracket syntax
 * `createArrayDeclaration({ nodes: [stringType], arrayType: 'array' }) // → string[]`
 *
 * @example Generic Array syntax
 * `createArrayDeclaration({ nodes: [stringType], arrayType: 'generic' }) // → Array<string>`
 */
export function createArrayDeclaration({ nodes, arrayType = 'array' }: { nodes: Array<ts.TypeNode>; arrayType?: 'array' | 'generic' }): ts.TypeNode | null {
  if (!nodes.length) {
    return factory.createTupleTypeNode([])
  }

  if (nodes.length === 1) {
    const node = nodes[0]
    if (!node) {
      return null
    }
    if (arrayType === 'generic') {
      return factory.createTypeReferenceNode(factory.createIdentifier('Array'), [node])
    }
    return factory.createArrayTypeNode(node)
  }

  // For union types (multiple nodes), respect arrayType preference
  const unionType = factory.createUnionTypeNode(nodes)
  if (arrayType === 'generic') {
    return factory.createTypeReferenceNode(factory.createIdentifier('Array'), [unionType])
  }
  // For array syntax with unions, we need parentheses: (string | number)[]
  return factory.createArrayTypeNode(factory.createParenthesizedType(unionType))
}

/**
 * Minimum nodes length of 2
 * @example Union type example
 * `string | number`
 */
export function createUnionDeclaration({ nodes, withParentheses }: { nodes: Array<ts.TypeNode>; withParentheses?: boolean }): ts.TypeNode {
  if (!nodes.length) {
    return keywordTypeNodes.any
  }

  if (nodes.length === 1) {
    return nodes[0] as ts.TypeNode
  }

  const node = factory.createUnionTypeNode(nodes)

  if (withParentheses) {
    return factory.createParenthesizedType(node)
  }

  return node
}

/**
 * Creates a TypeScript property signature for object/interface members.
 * Supports optional markers, readonly modifiers, and type annotations.
 */
export function createPropertySignature({
  readOnly,
  modifiers = [],
  name,
  questionToken,
  type,
}: {
  readOnly?: boolean
  modifiers?: Array<ts.Modifier>
  name: ts.PropertyName | string
  questionToken?: ts.QuestionToken | boolean
  type?: ts.TypeNode
}) {
  return factory.createPropertySignature(
    [...modifiers, readOnly ? factory.createToken(typescript.SyntaxKind.ReadonlyKeyword) : undefined].filter(
      (modifier): modifier is ts.Modifier => modifier !== undefined,
    ),
    propertyName(name),
    createQuestionToken(questionToken),
    type,
  )
}

/**
 * Attaches JSDoc comments to an AST node as synthetic leading comments.
 * Filters out undefined comments before attaching.
 *
 * @see https://github.com/microsoft/TypeScript/issues/44151
 */
export function appendJSDocToNode<TNode extends ts.Node>({ node, comments }: { node: TNode; comments: Array<string | undefined> }) {
  const filteredComments = comments.filter(Boolean)

  if (!filteredComments.length) {
    return node
  }

  const text = filteredComments.reduce((acc = '', comment = '') => {
    return `${acc}\n * ${comment.replaceAll('*/', '*\\/')}`
  }, '*')

  // Use the node directly instead of spreading to avoid creating Unknown nodes
  // TypeScript's addSyntheticLeadingComment accepts the node as-is
  return typescript.addSyntheticLeadingComment(node, typescript.SyntaxKind.MultiLineCommentTrivia, `${text || '*'}\n`, true)
}

/**
 * Creates a TypeScript index signature for dynamic property access.
 * Defines the key type (default: `string`) and value type on an object.
 */
function createIndexSignature(
  type: ts.TypeNode,
  {
    modifiers,
    indexName = 'key',
    indexType = factory.createKeywordTypeNode(typescript.SyntaxKind.StringKeyword),
  }: {
    indexName?: string
    indexType?: ts.TypeNode
    decorators?: Array<ts.Decorator>
    modifiers?: Array<ts.Modifier>
  } = {},
) {
  return factory.createIndexSignature(modifiers, [factory.createParameterDeclaration(undefined, undefined, indexName, undefined, indexType)], type)
}

/**
 * Creates a TypeScript type alias declaration with optional modifiers and type parameters.
 */
function createTypeAliasDeclaration({
  modifiers,
  name,
  typeParameters,
  type,
}: {
  modifiers?: Array<ts.Modifier>
  name: string | ts.Identifier
  typeParameters?: Array<ts.TypeParameterDeclaration>
  type: ts.TypeNode
}) {
  return factory.createTypeAliasDeclaration(modifiers, name, typeParameters, type)
}

/**
 * Creates a TypeScript interface declaration with optional modifiers, type parameters, and members.
 */
function createInterfaceDeclaration({
  modifiers,
  name,
  typeParameters,
  members,
}: {
  modifiers?: Array<ts.Modifier>
  name: string | ts.Identifier
  typeParameters?: Array<ts.TypeParameterDeclaration>
  members: Array<ts.TypeElement>
}) {
  return factory.createInterfaceDeclaration(modifiers, name, typeParameters, undefined, members)
}

/**
 * Creates a TypeScript type declaration as either a type alias or interface.
 * Intelligently selects the syntax based on the type structure and attaches JSDoc comments.
 */
export function createTypeDeclaration({
  syntax,
  isExportable,
  comments,
  name,
  type,
}: {
  syntax: 'type' | 'interface'
  comments: Array<string | undefined>
  isExportable?: boolean
  name: string | ts.Identifier
  type: ts.TypeNode
}) {
  if (syntax === 'interface' && typescript.isTypeLiteralNode(type)) {
    const node = createInterfaceDeclaration({
      members: [...type.members],
      modifiers: isExportable ? [modifiers.export] : [],
      name,
      typeParameters: undefined,
    })

    return appendJSDocToNode({
      node,
      comments,
    })
  }

  const node = createTypeAliasDeclaration({
    type,
    modifiers: isExportable ? [modifiers.export] : [],
    name,
    typeParameters: undefined,
  })

  return appendJSDocToNode({
    node,
    comments,
  })
}

/**
 * Apply casing transformation to enum keys
 */
function applyEnumKeyCasing(key: string, casing: 'screamingSnakeCase' | 'snakeCase' | 'pascalCase' | 'camelCase' | 'none' = 'none'): string {
  if (casing === 'none') {
    return key
  }
  if (casing === 'screamingSnakeCase') {
    return screamingSnakeCase(key)
  }
  if (casing === 'snakeCase') {
    return snakeCase(key)
  }
  if (casing === 'pascalCase') {
    return pascalCase(key)
  }
  if (casing === 'camelCase') {
    return camelCase(key)
  }
  return key
}

/**
 * Creates a TypeScript enum declaration or equivalent construct in various formats.
 * Returns a tuple of [name node, type node] - name node may be undefined for certain types.
 *
 * @example
 * ```ts
 * const [name, type] = createEnumDeclaration({
 *   type: 'enum',
 *   name: 'petType',
 *   typeName: 'PetType',
 *   enums: [['cat', 'cat', 'A cat'], ['dog', 'dog']],
 * })
 * ```
 */
export function createEnumDeclaration({
  type = 'enum',
  name,
  typeName,
  enums,
  enumKeyCasing = 'none',
}: {
  /**
   * Choose to use `enum`, `asConst`, `constEnum`, or `literal` for enums.
   * - `enum`: TypeScript enum
   * - `asConst`: const object asserted with `as const` (the caller decides the const name casing)
   * - `constEnum`: const enum
   * - `literal`: literal union type
   * @default `'enum'`
   */
  type?: 'enum' | 'asConst' | 'constEnum' | 'literal' | 'inlineLiteral'
  /**
   * Enum name in camelCase.
   */
  name: string
  /**
   * Enum name in PascalCase.
   */
  typeName: string
  enums: Array<[key: string | number, value: string | number | boolean, description?: string]>
  /**
   * Choose the casing for enum key names.
   * @default 'none'
   */
  enumKeyCasing?: 'screamingSnakeCase' | 'snakeCase' | 'pascalCase' | 'camelCase' | 'none'
}): [name: ts.Node | undefined, type: ts.Node] {
  if (type === 'literal' || type === 'inlineLiteral') {
    return [
      undefined,
      factory.createTypeAliasDeclaration(
        [factory.createToken(typescript.SyntaxKind.ExportKeyword)],
        factory.createIdentifier(typeName),
        undefined,
        factory.createUnionTypeNode(
          enums
            .map(([_key, value]) => {
              if (isNumber(value)) {
                if (value < 0) {
                  return factory.createLiteralTypeNode(
                    factory.createPrefixUnaryExpression(typescript.SyntaxKind.MinusToken, factory.createNumericLiteral(Math.abs(value))),
                  )
                }
                return factory.createLiteralTypeNode(factory.createNumericLiteral(value?.toString()))
              }

              if (typeof value === 'boolean') {
                return factory.createLiteralTypeNode(value ? factory.createTrue() : factory.createFalse())
              }
              if (value !== null && value !== undefined) {
                return factory.createLiteralTypeNode(factory.createStringLiteral(value.toString()))
              }

              return undefined
            })
            .filter((node): node is ts.LiteralTypeNode => node !== undefined),
        ),
      ),
    ]
  }

  if (type === 'enum' || type === 'constEnum') {
    return [
      undefined,
      factory.createEnumDeclaration(
        [
          factory.createToken(typescript.SyntaxKind.ExportKeyword),
          type === 'constEnum' ? factory.createToken(typescript.SyntaxKind.ConstKeyword) : undefined,
        ].filter(
          (modifier): modifier is ts.ModifierToken<ts.SyntaxKind.ExportKeyword> | ts.ModifierToken<ts.SyntaxKind.ConstKeyword> => modifier !== undefined,
        ),
        factory.createIdentifier(typeName),
        enums
          .map(([key, value, description]) => {
            let initializer: ts.Expression = factory.createStringLiteral(value?.toString())
            const isExactNumber = Number.parseInt(value.toString(), 10) === value

            if (isExactNumber && isNumber(value)) {
              if (value < 0) {
                initializer = factory.createPrefixUnaryExpression(typescript.SyntaxKind.MinusToken, factory.createNumericLiteral(Math.abs(value)))
              } else {
                initializer = factory.createNumericLiteral(value)
              }
            }

            if (typeof value === 'boolean') {
              initializer = value ? factory.createTrue() : factory.createFalse()
            }

            if (isNumber(Number.parseInt(key.toString(), 10))) {
              const casingKey = applyEnumKeyCasing(`${typeName}_${key}`, enumKeyCasing)
              return appendJSDocToNode({ node: factory.createEnumMember(propertyName(casingKey), initializer), comments: [description] })
            }

            if (key !== null && key !== undefined) {
              const casingKey = applyEnumKeyCasing(key.toString(), enumKeyCasing)
              return appendJSDocToNode({ node: factory.createEnumMember(propertyName(casingKey), initializer), comments: [description] })
            }

            return undefined
          })
          .filter((member): member is ts.EnumMember => member !== undefined),
      ),
    ]
  }

  // used when using `as const` instead of an TypeScript enum.
  // name is already cased by the caller (camelCase or pascalCase, driven by enum.constCasing).
  // typeName carries the typeSuffix for the type alias, so we use name for the const identifier.
  const identifierName = name

  // When there are no enum items (empty or all-null enum), don't generate a runtime const.
  // Return undefined for nameNode so the barrel won't try to export a non-existent symbol.
  // Use `never` as the type alias to keep references valid without creating a broken const.
  if (enums.length === 0) {
    return [
      undefined,
      factory.createTypeAliasDeclaration(
        [factory.createToken(typescript.SyntaxKind.ExportKeyword)],
        factory.createIdentifier(typeName),
        undefined,
        factory.createKeywordTypeNode(typescript.SyntaxKind.NeverKeyword),
      ),
    ]
  }

  return [
    factory.createVariableStatement(
      [factory.createToken(typescript.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier(identifierName),
            undefined,
            undefined,
            factory.createAsExpression(
              factory.createObjectLiteralExpression(
                enums
                  .map(([key, value, description]) => {
                    let initializer: ts.Expression = factory.createStringLiteral(value?.toString())

                    if (isNumber(value)) {
                      // Error: Negative numbers should be created in combination with createPrefixUnaryExpression factory.
                      // The method createNumericLiteral only accepts positive numbers
                      // or those combined with createPrefixUnaryExpression.
                      // Therefore, we need to ensure that the number is not negative.
                      if (value < 0) {
                        initializer = factory.createPrefixUnaryExpression(typescript.SyntaxKind.MinusToken, factory.createNumericLiteral(Math.abs(value)))
                      } else {
                        initializer = factory.createNumericLiteral(value)
                      }
                    }

                    if (typeof value === 'boolean') {
                      initializer = value ? factory.createTrue() : factory.createFalse()
                    }

                    if (key !== null && key !== undefined) {
                      const casingKey = applyEnumKeyCasing(key.toString(), enumKeyCasing)
                      return appendJSDocToNode({ node: factory.createPropertyAssignment(propertyName(casingKey), initializer), comments: [description] })
                    }

                    return undefined
                  })
                  .filter((property): property is ts.PropertyAssignment => property !== undefined),
                true,
              ),
              factory.createTypeReferenceNode(factory.createIdentifier('const'), undefined),
            ),
          ),
        ],
        typescript.NodeFlags.Const,
      ),
    ),
    factory.createTypeAliasDeclaration(
      [factory.createToken(typescript.SyntaxKind.ExportKeyword)],
      factory.createIdentifier(typeName),
      undefined,
      factory.createIndexedAccessTypeNode(
        factory.createParenthesizedType(factory.createTypeQueryNode(factory.createIdentifier(identifierName), undefined)),
        factory.createTypeOperatorNode(typescript.SyntaxKind.KeyOfKeyword, factory.createTypeQueryNode(factory.createIdentifier(identifierName), undefined)),
      ),
    ),
  ]
}

/**
 * Creates a TypeScript `Omit<T, Keys>` type reference node.
 * Optionally wraps the type in `NonNullable<T>` if `nonNullable` is true.
 */
export function createOmitDeclaration({ keys, type, nonNullable }: { keys: Array<string> | string; type: ts.TypeNode; nonNullable?: boolean }) {
  const node = nonNullable ? factory.createTypeReferenceNode(factory.createIdentifier('NonNullable'), [type]) : type

  if (Array.isArray(keys)) {
    return factory.createTypeReferenceNode(factory.createIdentifier('Omit'), [
      node,
      factory.createUnionTypeNode(
        keys.map((key) => {
          return factory.createLiteralTypeNode(factory.createStringLiteral(key))
        }),
      ),
    ])
  }

  return factory.createTypeReferenceNode(factory.createIdentifier('Omit'), [node, factory.createLiteralTypeNode(factory.createStringLiteral(keys))])
}

/**
 * Pre-built TypeScript keyword type nodes for common primitive types.
 * Use these to avoid repeatedly creating the same type nodes.
 */
export const keywordTypeNodes = {
  any: factory.createKeywordTypeNode(typescript.SyntaxKind.AnyKeyword),
  unknown: factory.createKeywordTypeNode(typescript.SyntaxKind.UnknownKeyword),
  void: factory.createKeywordTypeNode(typescript.SyntaxKind.VoidKeyword),
  number: factory.createKeywordTypeNode(typescript.SyntaxKind.NumberKeyword),
  integer: factory.createKeywordTypeNode(typescript.SyntaxKind.NumberKeyword),
  bigint: factory.createKeywordTypeNode(typescript.SyntaxKind.BigIntKeyword),
  object: factory.createKeywordTypeNode(typescript.SyntaxKind.ObjectKeyword),
  string: factory.createKeywordTypeNode(typescript.SyntaxKind.StringKeyword),
  boolean: factory.createKeywordTypeNode(typescript.SyntaxKind.BooleanKeyword),
  undefined: factory.createKeywordTypeNode(typescript.SyntaxKind.UndefinedKeyword),
  null: factory.createLiteralTypeNode(factory.createToken(typescript.SyntaxKind.NullKeyword)),
  never: factory.createKeywordTypeNode(typescript.SyntaxKind.NeverKeyword),
} as const

/**
 * Converts a path like '/pet/{petId}/uploadImage' to a template literal type
 * like `/pet/${string}/uploadImage`
 */
/**
 * Converts an OAS-style path (e.g. `/pets/{petId}`) or an Express-style path
 * (e.g. `/pets/:petId`) to a TypeScript template literal type
 * like `` `/pets/${string}` ``.
 */
export function createUrlTemplateType(path: string): ts.TypeNode {
  // normalized Express `:param` → OAS `{param}` so a single regex handles both.
  const normalized = path.replace(/:([^/]+)/g, '{$1}')

  if (!normalized.includes('{')) {
    return factory.createLiteralTypeNode(factory.createStringLiteral(normalized))
  }

  const segments = normalized.split(/(\{[^}]+\})/)
  const parts: Array<string> = []
  const parameterIndices: Array<number> = []

  segments.forEach((segment) => {
    if (segment.startsWith('{') && segment.endsWith('}')) {
      parameterIndices.push(parts.length)
      parts.push(segment)
    } else if (segment) {
      parts.push(segment)
    }
  })

  const head = typescript.factory.createTemplateHead(parts[0] || '')
  const templateSpans: Array<ts.TemplateLiteralTypeSpan> = []

  parameterIndices.forEach((paramIndex, i) => {
    const isLast = i === parameterIndices.length - 1
    const nextPart = parts[paramIndex + 1] || ''
    const literal = isLast ? typescript.factory.createTemplateTail(nextPart) : typescript.factory.createTemplateMiddle(nextPart)
    templateSpans.push(typescript.factory.createTemplateLiteralTypeSpan(keywordTypeNodes.string, literal))
  })

  return typescript.factory.createTemplateLiteralType(head, templateSpans)
}

/**
 * Creates a TypeScript type literal node (anonymous object type).
 */
export const createTypeLiteralNode = factory.createTypeLiteralNode

/**
 * Creates a TypeScript type reference node (e.g., `Array<string>`, `Record<K, V>`).
 */
export const createTypeReferenceNode = factory.createTypeReferenceNode

/**
 * Creates a numeric literal type node.
 */
const createNumericLiteral = factory.createNumericLiteral

/**
 * Creates a string literal type node.
 */
const createStringLiteral = factory.createStringLiteral

/**
 * Creates an array type node (e.g., `T[]`).
 */
const createArrayTypeNode = factory.createArrayTypeNode

/**
 * Creates a literal type node (e.g., `'hello'`, `42`, `true`).
 */
const createLiteralTypeNode = factory.createLiteralTypeNode

/**
 * Creates an identifier node.
 */
const createIdentifier = factory.createIdentifier

/**
 * Creates an optional type node (e.g., `T | undefined`).
 */
const createOptionalTypeNode = factory.createOptionalTypeNode

/**
 * Creates a tuple type node (e.g., `[string, number]`).
 */
const createTupleTypeNode = factory.createTupleTypeNode

/**
 * Creates a rest type node for variadic tuple elements (e.g., `...T[]`).
 */
const createRestTypeNode = factory.createRestTypeNode

/**
 * Creates a boolean true literal type node.
 */
const createTrue = factory.createTrue

/**
 * Creates a boolean false literal type node.
 */
const createFalse = factory.createFalse

/**
 * Creates a prefix unary expression (e.g., negative numbers, logical not).
 */
const createPrefixUnaryExpression = factory.createPrefixUnaryExpression

// ─── Printer helpers ──────────────────────────────────────────────────────────

/**
 * Converts a primitive const value to a TypeScript literal type node.
 * Handles negative numbers via a prefix unary expression.
 */
export function constToTypeNode(value: string | number | boolean, format: 'string' | 'number' | 'boolean'): ts.TypeNode | undefined {
  if (format === 'boolean') {
    return createLiteralTypeNode(value === true ? createTrue() : createFalse())
  }
  if (format === 'number' && typeof value === 'number') {
    if (value < 0) {
      return createLiteralTypeNode(createPrefixUnaryExpression(SyntaxKind.MinusToken, createNumericLiteral(Math.abs(value))))
    }
    return createLiteralTypeNode(createNumericLiteral(value))
  }
  return createLiteralTypeNode(createStringLiteral(String(value)))
}

/**
 * Returns a `Date` reference type node when `representation` is `'date'`, otherwise falls back to `string`.
 */
export function dateOrStringNode(node: { representation?: string }): ts.TypeNode {
  return node.representation === 'date' ? createTypeReferenceNode(createIdentifier('Date')) : keywordTypeNodes.string
}

/**
 * Maps an array of `SchemaNode`s through the printer, filtering out `null` and `undefined` results.
 */
export function buildMemberNodes(
  members: Array<ast.SchemaNode> | undefined,
  print: (node: ast.SchemaNode) => ts.TypeNode | null | undefined,
): Array<ts.TypeNode> {
  return (members ?? []).map(print).filter(isNonNullable)
}

/**
 * Builds a TypeScript tuple type node from an array schema's `items`,
 * applying min/max slice and optional/rest element rules.
 */
export function buildTupleNode(node: ast.ArraySchemaNode, print: (node: ast.SchemaNode) => ts.TypeNode | null | undefined): ts.TypeNode | undefined {
  let items = (node.items ?? []).map(print).filter(isNonNullable)

  const restNode = node.rest ? (print(node.rest) ?? undefined) : undefined
  const { min, max } = node

  if (max !== undefined) {
    items = items.slice(0, max)
    if (items.length < max && restNode) {
      items = [...items, ...Array(max - items.length).fill(restNode)]
    }
  }

  if (min !== undefined) {
    items = items.map((item, i) => (i >= min ? createOptionalTypeNode(item) : item))
  }

  if (max === undefined && restNode) {
    items.push(createRestTypeNode(createArrayTypeNode(restNode)))
  }

  return createTupleTypeNode(items)
}

/**
 * Applies `nullable` and optional/nullish `| undefined` union modifiers to a property's resolved base type.
 */
export function buildPropertyType(
  schema: ast.SchemaNode,
  baseType: ts.TypeNode,
  optionalType: 'questionToken' | 'undefined' | 'questionTokenAndUndefined',
  optional?: boolean,
): ts.TypeNode {
  const addsUndefined = OPTIONAL_ADDS_UNDEFINED.has(optionalType)
  const meta = syncSchemaRef(schema)

  let type = baseType

  if (meta.nullable) {
    type = createUnionDeclaration({ nodes: [type, keywordTypeNodes.null] })
  }

  if ((optional || meta.nullish || meta.optional) && addsUndefined) {
    type = createUnionDeclaration({ nodes: [type, keywordTypeNodes.undefined] })
  }

  return type
}

const indexSignaturePrinter = typescript.createPrinter()
const indexSignatureSource = typescript.createSourceFile('', '', typescript.ScriptTarget.Latest)

/**
 * Creates a TypeScript index signature for `additionalProperties` and `patternProperties` on an
 * object schema node. TypeScript allows only one string index signature and its value must be
 * assignable from every named property, so both keywords collapse into a single signature: the
 * union of all value types (deduplicated), or `unknown` when the object also has fixed properties.
 * The key regex of `patternProperties` cannot be expressed by an index signature and is dropped.
 */
export function buildIndexSignatures(
  node: { additionalProperties?: ast.SchemaNode | boolean; patternProperties?: Record<string, ast.SchemaNode> },
  propertyCount: number,
  print: (node: ast.SchemaNode) => ts.TypeNode | null | undefined,
): Array<ts.TypeElement> {
  const valueTypes: Array<ts.TypeNode> = []

  if (node.additionalProperties && node.additionalProperties !== true) {
    valueTypes.push(print(node.additionalProperties) ?? keywordTypeNodes.unknown)
  } else if (node.additionalProperties === true) {
    valueTypes.push(keywordTypeNodes.unknown)
  }

  for (const schema of Object.values(node.patternProperties ?? {})) {
    const patternType = print(schema) ?? keywordTypeNodes.unknown
    valueTypes.push(schema.nullable ? createUnionDeclaration({ nodes: [patternType, keywordTypeNodes.null] }) : patternType)
  }

  if (valueTypes.length === 0) return []

  const seen = new Set<string>()
  const distinct = valueTypes.filter((type) => {
    const key = indexSignaturePrinter.printNode(typescript.EmitHint.Unspecified, type, indexSignatureSource)
    return seen.has(key) ? false : (seen.add(key), true)
  })

  return [createIndexSignature(propertyCount > 0 ? keywordTypeNodes.unknown : createUnionDeclaration({ nodes: distinct }))]
}
