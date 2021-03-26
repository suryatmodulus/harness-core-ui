import type { StringNGVariable, NumberNGVariable, SecretNGVariable } from 'services/cd-ng'

export type AllNGVariables = StringNGVariable | NumberNGVariable | SecretNGVariable

export interface ExecutionPageQueryParams {
  stage?: string
  step?: string
}
