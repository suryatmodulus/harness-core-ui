import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionVerificationView } from '../ExecutionVerificationView'

describe('Unit tests for ExecutionVerificationView unit tests', () => {
  test('Ensure tabs are rendered', async () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationView />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
