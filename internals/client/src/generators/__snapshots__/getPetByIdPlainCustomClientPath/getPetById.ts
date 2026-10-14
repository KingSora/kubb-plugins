/* eslint-disable no-alert, no-console */

import type { GetPetByIdOptions, GetPetByIdResponses } from './GetPetById'
import type { Options, RequestResult } from '@acme/api-client'
import { client } from '@acme/api-client'

/**
 * {@link /pet/:petId}
 */
export function getPetById<ThrowOnError extends boolean = true>(
  options: Options<GetPetByIdOptions, ThrowOnError>,
): Promise<RequestResult<GetPetByIdResponses, ThrowOnError>> {
  const { client: request = client, ...config } = options

  return request({ method: 'GET', url: '/pet/{petId}', ...config, throwOnError: config.throwOnError ?? true }) as Promise<
    RequestResult<GetPetByIdResponses, ThrowOnError>
  >
}
