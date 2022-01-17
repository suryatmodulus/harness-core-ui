/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const cvDefaultFailureStrategies = [
  {
    onFailure: {
      errors: ['Verification'],
      action: {
        type: 'ManualIntervention',
        spec: {
          timeout: '2h',
          onTimeout: {
            action: {
              type: 'StageRollback'
            }
          }
        }
      }
    }
  },
  {
    onFailure: {
      errors: ['AnyOther'],
      action: {
        type: 'ManualIntervention',
        spec: {
          timeout: '2h',
          onTimeout: {
            action: {
              type: 'Ignore'
            }
          }
        }
      }
    }
  }
]
