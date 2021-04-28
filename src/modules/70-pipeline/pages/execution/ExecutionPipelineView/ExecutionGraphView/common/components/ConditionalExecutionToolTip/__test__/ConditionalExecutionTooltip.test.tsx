import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { Modes } from '@pipeline/components/PipelineSteps/AdvancedSteps/common'
import ConditionalExecutionTooltip, { ConditionalExecutionToolTipProps } from '../ConditionalExecutionTooltip'

const getProps = (): ConditionalExecutionToolTipProps => ({
  mode: Modes.STAGE,
  data: {
    whenCondition: '<+OnPipelineSuccess> && (some JEXL condition)',
    evaluatedCondition: true
  }
})

describe('ConditionalExecution', () => {
  test('matches snapshot when no data', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <ConditionalExecutionTooltip {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
