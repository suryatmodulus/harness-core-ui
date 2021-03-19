import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SelectCVConnector } from '../SelectCVConnector'

describe('Unit tests for SelectCVConnector', () => {
  test('Ensure that component renders with passed in props', async () => {
    const { container } = render(
      <TestWrapper>
        <SelectCVConnector
          connectorTypeLabel="New Relic"
          connectorType="NewRelic"
          stepLabelProps={{ stepNumber: 1, totalSteps: 2 }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container).toMatchSnapshot())
  })
})
