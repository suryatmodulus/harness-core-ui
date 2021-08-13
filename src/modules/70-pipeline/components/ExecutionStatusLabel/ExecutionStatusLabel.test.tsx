import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionStatusEnum, ExecutionStatus } from '@pipeline/utils/statusHelpers'
import ExecutionStatusLabel from './ExecutionStatusLabel'

describe('<ExecutionStatusLabel /> tests', () => {
  test.each(Object.values(ExecutionStatusEnum))('%s', (status: ExecutionStatus) => {
    const { container } = render(
      <TestWrapper>
        <ExecutionStatusLabel status={status} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
