/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* global fail */
import { yupToFormErrors } from 'formik'
import type { StringKeys } from 'framework/strings'

import { Strategy, ErrorType } from '@pipeline/utils/FailureStrategyUtils'
import { getFailureStrategiesValidationSchema } from '../validation'

function stringifyErrors(e: any): string {
  return JSON.stringify(yupToFormErrors(e), null, 2).replace(/"([^"]+)":/g, '$1:')
}

function getString(key: StringKeys): StringKeys {
  return key
}

describe('getFailureStrategiesValidationSchema tests', () => {
  test('validation works for "onFailure" key', () => {
    const schema = getFailureStrategiesValidationSchema(getString)

    try {
      schema.validateSync([{}])
      fail('Validation was not correct')
    } catch (e) {
      expect(stringifyErrors(e)).toMatchInlineSnapshot(`
        "{
          0: {
            onFailure: {
              action: {
                type: \\"pipeline.failureStrategies.validation.actionRequired\\"
              }
            }
          }
        }"
      `)
    }
  })
  test('validation works for "errors" and "action" keys', () => {
    const schema = getFailureStrategiesValidationSchema(getString)

    try {
      schema.validateSync([{ onFailure: {} }])
      fail('Validation was not correct')
    } catch (e) {
      expect(stringifyErrors(e)).toMatchInlineSnapshot(`
        "{
          0: {
            onFailure: {
              action: {
                type: \\"pipeline.failureStrategies.validation.actionRequired\\"
              }
            }
          }
        }"
      `)
    }
  })

  test('validation works for ManualIntervention', () => {
    const schema = getFailureStrategiesValidationSchema(getString)

    try {
      schema.validateSync([{ onFailure: { action: { type: Strategy.ManualIntervention } } }])
      fail('Validation was not correct')
    } catch (e) {
      expect(stringifyErrors(e)).toMatchInlineSnapshot(`
        "{
          0: {
            onFailure: {
              action: {
                spec: {
                  onTimeout: {
                    action: {
                      type: \\"pipeline.failureStrategies.validation.onTimeoutRequired\\"
                    }
                  }
                }
              }
            }
          }
        }"
      `)
    }
  })

  test('validation works for Retry', () => {
    const schema = getFailureStrategiesValidationSchema(getString)

    try {
      schema.validateSync([{ onFailure: { action: { type: Strategy.Retry } } }])
      fail('Validation was not correct')
    } catch (e) {
      expect(stringifyErrors(e)).toMatchInlineSnapshot(`
        "{
          0: {
            onFailure: {
              action: {
                spec: {
                  onRetryFailure: {
                    action: {
                      type: \\"pipeline.failureStrategies.validation.onRetryFailureRequired\\"
                    }
                  }
                }
              }
            }
          }
        }"
      `)
    }
  })

  test('validation works for Retry - Runtime input "retryCount"', () => {
    const schema = getFailureStrategiesValidationSchema(getString)

    try {
      schema.validateSync([
        {
          onFailure: {
            errors: [ErrorType.Unknown],
            action: {
              type: Strategy.Retry,
              spec: {
                retryCount: '<+input>',
                retryIntervals: ['1d'],
                onRetryFailure: {
                  action: {
                    type: Strategy.Abort
                  }
                }
              }
            }
          }
        }
      ])
      expect(1).toBe(1)
    } catch (e) {
      fail('Validation did not work')
    }
  })

  test('validation works for Retry - "retryCount" is respected', () => {
    const schema = getFailureStrategiesValidationSchema(getString)

    try {
      schema.validateSync([
        {
          onFailure: {
            errors: [ErrorType.Unknown],
            action: {
              type: Strategy.Retry,
              spec: {
                retryCount: 3,
                retryIntervals: ['1d', '1d', '1d', '1d'],
                onRetryFailure: {
                  action: {
                    type: Strategy.Abort
                  }
                }
              }
            }
          }
        }
      ])
      fail('Validation was not correct')
    } catch (e) {
      expect(stringifyErrors(e)).toMatchInlineSnapshot(`
        "{
          0: {
            onFailure: {
              action: {
                spec: {
                  retryIntervals: \\"pipeline.failureStrategies.validation.retryIntervalMaxmimum\\"
                }
              }
            }
          }
        }"
      `)
    }
  })
})
