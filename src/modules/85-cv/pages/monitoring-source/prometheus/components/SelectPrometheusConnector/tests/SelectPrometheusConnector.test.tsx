import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Button } from '@wings-software/uicore'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import * as onboardingUtils from '@cv/pages/onboarding/CVOnBoardingUtils'
import { SelectPrometheusConnector } from '../SelectPrometheusConnector'

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
        <SelectPrometheusConnector />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

jest.mock('@cv/components/CVSetupSourcesView/SelectCVConnector/SelectCVConnector', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SelectCVConnector/SelectCVConnector') as any),
  SelectCVConnector: function MockSelectCVConnector(props: any) {
    return (
      <Button
        className="selectConnector"
        onClick={() =>
          props.onCreateConnector({
            projectIdentifier: '1234_project',
            connector: {
              name: 'prometheusConn',
              identifier: 'prometheusConn'
            }
          })
        }
      />
    )
  }
}))

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { productName: 'apm' },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

describe('Unit test for SelectPrometheus Connector', () => {
  test('Ensure validation works', async () => {
    const { container, getByText } = render(<WrapperComponent />)
    await waitFor(() => expect(container.querySelector('[class*="defineMonitoringSource"]')).not.toBeNull())

    fireEvent.click(getByText('next'))
    await waitFor(() => expect(getByText('cv.onboarding.selectProductScreen.validationText.name')).not.toBeNull())

    // fill out both fields and ensure submit value is as expected
    await setFieldValue({
      container,
      type: InputTypes.TEXTFIELD,
      fieldId: 'monitoringSourceName',
      value: 'PrometheusMonitoringSource'
    })

    // fill out second field
    const buildConnectorSpy = jest.spyOn(onboardingUtils, 'buildConnectorRef')
    fireEvent.click(container.querySelector('[class*="selectConnector"]')!)
    await waitFor(() => {
      expect(buildConnectorSpy).toHaveBeenCalled()
    })

    await waitFor(() => expect(getByText('cv.onboarding.monitoringSources.selectProduct')).not.toBeNull())
    fireEvent.click(getByText('next'))
    await waitFor(() =>
      expect(onNextMock).toHaveBeenCalledWith(
        {
          connectorRef: {
            label: 'prometheusConn',
            scope: 'account',
            value: 'account.prometheusConn'
          },
          identifier: 'PrometheusMonitoringSource',
          monitoringSourceName: 'PrometheusMonitoringSource',
          productName: 'apm'
        },
        { tabStatus: 'SUCCESS' }
      )
    )
  })
})
