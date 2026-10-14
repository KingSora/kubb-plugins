import { ast } from 'kubb/kit'
import { resolverZod } from '@kubb/plugin-zod'
import { describe, expect, test } from 'vitest'
import { buildZodResponseParse, isValidatorEnabled } from './validatorOptions.ts'

const node = ast.factory.createOperation({
  operationId: 'addPet',
  method: 'POST',
  path: '/pet',
  tags: ['pet'],
  responses: [ast.factory.createResponse({ statusCode: '200', schema: ast.factory.createSchema({ type: 'object', properties: [] }), description: 'ok' })],
})

describe('validator resolvers', () => {
  test('isValidatorEnabled tracks every form', () => {
    expect(isValidatorEnabled(false)).toBe(false)
    expect(isValidatorEnabled('zod')).toBe(true)
    expect(isValidatorEnabled({ request: 'zod' })).toBe(true)
    expect(isValidatorEnabled({})).toBe(false)
  })
})

describe('buildZodResponseParse', () => {
  test('resolves the success-only response schema', () => {
    expect(buildZodResponseParse(node, resolverZod)).toStrictEqual({ expression: 'addPetResponseSchema', importNames: ['addPetResponseSchema'] })
  })
})
