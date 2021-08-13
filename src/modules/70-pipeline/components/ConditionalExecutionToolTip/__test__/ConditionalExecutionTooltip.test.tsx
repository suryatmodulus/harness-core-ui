import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import ConditionalExecutionTooltipWrapper, {
  ConditionalExecutionToolTipWrapperProps
} from '../ConditionalExecutionTooltipWrapper'

const getProps = (): ConditionalExecutionToolTipWrapperProps => ({
  mode: Modes.STAGE,
  data: {
    whenCondition: '<+OnPipelineSuccess> && (some JEXL condition)',
    expressions: [
      {
        expression: 'some expression',
        expressionValue: 'some value'
      }
    ]
  }
})

describe('ConditionalExecutionToolTip', () => {
  test('matches snapshot', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <ConditionalExecutionTooltipWrapper {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
