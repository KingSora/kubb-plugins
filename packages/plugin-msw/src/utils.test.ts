import { ast } from 'kubb/kit'
import { describe, expect, test } from 'vitest'
import { getContentType, getMswMethod, hasResponseSchema } from './utils.ts'

// `HttpMethod` lists 'QUERY' from a later @kubb/ast release than this repo builds against.
const queryMethod = 'QUERY' as string as ast.HttpMethod

describe('response schema utilities', () => {
  test('treats a placeholder unknown schema without a content type as bodyless', () => {
    const response = ast.factory.createResponse({
      statusCode: '200',
      description: 'OK',
      schema: ast.factory.createSchema({ type: 'unknown' }),
    })

    expect(hasResponseSchema(response)).toBe(false)
    expect(getContentType(response)).toBe(null)
  })
})

describe('getMswMethod', () => {
  test('lowercases a method MSW has a helper for', () => {
    expect(getMswMethod(ast.factory.createOperation({ operationId: 'createPet', method: 'POST', path: '/pets' }))).toBe('post')
  })

  test('maps QUERY to all, since MSW has no query helper', () => {
    expect(getMswMethod(ast.factory.createOperation({ operationId: 'searchPets', method: queryMethod, path: '/pets/search' }))).toBe('all')
  })
})
