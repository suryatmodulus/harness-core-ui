import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import DefineHealthSource from '../DefineHealthSource'

const createModeProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: {},
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

describe('DefineHealthSource', () => {
  test('should have proper validation', async () => {
    const { getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )
    // next button visible
    expect(getByText('next')).not.toBeNull()
    await act(async () => {
      //click next
      fireEvent.click(getByText('next'))
      // check error texts
      await waitFor(() => expect(getByText('cv.onboarding.selectProductScreen.validationText.source')).not.toBeNull())
      await waitFor(() => expect(getByText('cv.onboarding.selectProductScreen.validationText.name')).not.toBeNull())
      await waitFor(() =>
        expect(getByText('cv.onboarding.selectProductScreen.validationText.connectorRef')).not.toBeNull()
      )
    })
  })
})
