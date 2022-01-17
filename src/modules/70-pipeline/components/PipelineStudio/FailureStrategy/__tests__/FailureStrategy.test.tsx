/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { ErrorType } from '@pipeline/utils/FailureStrategyUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { FailureStrategyWithRef } from '../FailureStrategy'

describe('<Failure Strategy/> tests', () => {
  test('renders ok with no data', () => {
    const { container } = render(
      <TestWrapper>
        <FailureStrategyWithRef isReadonly={false} selectedStage={{}} onUpdate={jest.fn()} ref={{ current: null }} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('renders ok with data', () => {
    const { container } = render(
      <TestWrapper>
        <FailureStrategyWithRef
          selectedStage={{
            stage: {
              name: 'test',
              identifier: 'test',
              type: 'CI',
              failureStrategies: [
                {
                  onFailure: {
                    errors: [ErrorType.Unknown],
                    action: {
                      type: 'Ignore'
                    }
                  }
                }
              ]
            }
          }}
          isReadonly={false}
          onUpdate={jest.fn()}
          ref={{ current: null }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
