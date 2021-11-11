import type { MultiTypeInputType } from '@wings-software/uicore'
import { getMultiTypeInputProps } from '../VerificationJobFields.utils'

describe('Test for VerificationJobFields Utils', () => {
  test('Test if getMultiTypeInputProps method gives correct results', () => {
    expect(
      getMultiTypeInputProps(['infrastructure', 'pipeline'], ['FIXED', 'RUNTIME', 'EXPRESSION'] as MultiTypeInputType[])
    ).toEqual({
      expressions: ['infrastructure', 'pipeline'],
      allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION']
    })
  })
})
