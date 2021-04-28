import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HoverCard, { HoverCardProps } from '@pipeline/components/HoverCard/HoverCard'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'

const getProps = (): HoverCardProps => ({
  data: {
    data: {
      startTs: 1619479030,
      endTs: 1619482630,
      failureInfo: {
        message: 'Failure message'
      }
    },
    status: ExecutionStatusEnum.Failed
  }
})

describe('ConditionalExecution', () => {
  test('matches snapshot with failure', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <HoverCard {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
