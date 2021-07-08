import React from 'react'
import { waitFor } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { VerifyExecution } from '../VerifyExecution'

describe('Unit tests for VerifyExection', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      } as any
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('Ensure content is rendered based on input', async () => {
    const { getByText } = render(
      <TestWrapper>
        <VerifyExecution step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('pipeline.verification.metricsInViolation')).not.toBeNull())
  })
})
