import { describe, expect, test } from 'vitest'
import { isValidatorEnabled } from './validatorOptions.ts'

describe('validator resolvers', () => {
  test('isValidatorEnabled tracks every form', () => {
    expect(isValidatorEnabled(false)).toBe(false)
    expect(isValidatorEnabled('zod')).toBe(true)
    expect(isValidatorEnabled({ request: 'zod' })).toBe(true)
    expect(isValidatorEnabled({})).toBe(false)
  })
})
