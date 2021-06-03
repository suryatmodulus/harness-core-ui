import React from 'react'
import { render } from '@testing-library/react'
import { ErrorType } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
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
