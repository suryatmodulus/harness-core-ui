import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { TestWrapper } from '@common/utils/testUtils'
import { SelectNewRelicConnector } from '../SelectNewRelicConnector'

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
        <SelectNewRelicConnector />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Unit test for SelectNewRelic Connector', () => {
  test('Ensure validation works', async () => {
    const { container, getByText } = render(<WrapperComponent />)
    await waitFor(() => expect(container.querySelector('[class*="defineMonitoringSource"]')).not.toBeNull())

    fireEvent.click(getByText('next'))
    await waitFor(() =>
      expect(getByText('cv.onboarding.selectProductScreen.validationText.connectorRef')).not.toBeNull()
    )
    expect(getByText('cv.onboarding.selectProductScreen.validationText.name')).not.toBeNull()
  })
})
