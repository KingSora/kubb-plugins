import { ast } from 'kubb/kit'
import { resolverZod } from '@kubb/plugin-zod'
import { describe, expect, test } from 'vitest'
import { buildValidatorHooks } from './validator.ts'

const addPet = ast.factory.createOperation({
  operationId: 'addPet',
  method: 'POST',
  path: '/pet',
  tags: ['pet'],
  requestBody: {
    content: [ast.factory.createContent({ contentType: 'application/json', schema: ast.factory.createSchema({ type: 'object', properties: [] }) })],
  },
  responses: [ast.factory.createResponse({ statusCode: '200', schema: ast.factory.createSchema({ type: 'object', properties: [] }), description: 'ok' })],
})

const addPetWithError = ast.factory.createOperation({
  operationId: 'addPet',
  method: 'POST',
  path: '/pet',
  tags: ['pet'],
  responses: [
    ast.factory.createResponse({ statusCode: '200', schema: ast.factory.createSchema({ type: 'object', properties: [] }), description: 'ok' }),
    ast.factory.createResponse({ statusCode: '422', schema: ast.factory.createSchema({ type: 'object', properties: [] }), description: 'err' }),
  ],
})

describe('buildValidatorHooks', () => {
  test("the 'zod' shorthand also wires the error validator when an error response is documented", () => {
    const hooks = buildValidatorHooks({ node: addPetWithError, validator: 'zod', zodResolver: resolverZod })
    expect(hooks.response).toBe('addPetResponseSchema')
    expect(hooks.error).toBe('addPetErrorSchema')
    expect(hooks.importedZodNames).toStrictEqual(['addPetResponseSchema', 'addPetErrorSchema'])
  })

  test('the object form wires the request validator from the body schema', () => {
    const hooks = buildValidatorHooks({ node: addPet, validator: { request: 'zod' }, zodResolver: resolverZod })
    expect(hooks.request).toBe('addPetBodySchema')
    expect(hooks.response).toBeNull()
    expect(hooks.error).toBeNull()
    expect(hooks.importedZodNames).toStrictEqual(['addPetBodySchema'])
  })

  test('wires both directions when both are enabled', () => {
    const hooks = buildValidatorHooks({ node: addPet, validator: { request: 'zod', response: 'zod' }, zodResolver: resolverZod })
    expect(hooks.request).toBe('addPetBodySchema')
    expect(hooks.response).toBe('addPetResponseSchema')
    expect(hooks.error).toBeNull()
    expect(hooks.importedZodNames).toStrictEqual(['addPetBodySchema', 'addPetResponseSchema'])
  })
})
