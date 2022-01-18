/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { StageType } from '@pipeline/utils/stageHelpers'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { ErrorType, Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { errorTypesForStages } from '../StrategySelection/StrategyConfig'
import { Basic } from '../FailureStrategyPanel.stories'

describe('CD <FailureStrategyPanel /> tests', () => {
  test('adding all error types disable Add button and prevents new strategy addition', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: errorTypesForStages[StageType.DEPLOY],
                action: {
                  type: Strategy.Abort
                }
              }
            }
          ]
        }}
        mode={Modes.STAGE}
        stageType={StageType.DEPLOY}
      />
    )

    const add = await findByTestId('add-failure-strategy')

    expect(add.classList.contains('bp3-disabled')).toBe(true)
    expect(add.hasAttribute('disabled')).toBe(true)
  })

  test('in stage mode, cannot delete first error type', () => {
    const { queryByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: [ErrorType.Unknown],
                action: {
                  type: Strategy.Abort
                }
              }
            }
          ]
        }}
        mode={Modes.STAGE}
        stageType={StageType.DEPLOY}
      />
    )

    const del = queryByTestId('remove-failure-strategy')
    expect(del).toBeNull()
  })
})
