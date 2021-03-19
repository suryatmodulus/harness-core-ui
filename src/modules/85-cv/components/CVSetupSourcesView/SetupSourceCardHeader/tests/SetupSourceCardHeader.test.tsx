import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceCardHeader } from '../SetupSourceCardHeader'

describe('Unit tests for SetupSourceCardHeader', () => {
  test('Ensure card renders passed in props correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <SetupSourceCardHeader
          stepLabelProps={{ stepNumber: 2, totalSteps: 2 }}
          mainHeading="Main Heading"
          subHeading="SubHeading"
        />
      </TestWrapper>
    )
    await waitFor(() => expect(container).toMatchSnapshot())
  })
})
