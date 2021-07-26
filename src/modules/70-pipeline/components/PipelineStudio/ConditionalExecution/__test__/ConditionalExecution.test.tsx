import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ConditionalExecution, { ConditionalExecutionProps } from '../ConditionalExecution'

const getProps = (hasData: boolean): ConditionalExecutionProps => ({
  onUpdate: jest.fn(),
  isReadonly: false,
  selectedStage: {
    stage: {
      ...(hasData && {
        when: {
          pipelineStatus: 'Success',
          condition: 'some condition'
        }
      })
    } as any
  }
})

jest.mock('@common/components/MonacoEditor/MonacoEditor')

describe('ConditionalExecution', () => {
  test('matches snapshot when no data', () => {
    const props = getProps(false)
    const { container } = render(
      <TestWrapper>
        <ConditionalExecution {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})

describe('ConditionalExecution', () => {
  test('matches snapshot with data', () => {
    const props = getProps(true)
    const { container } = render(
      <TestWrapper>
        <ConditionalExecution {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
