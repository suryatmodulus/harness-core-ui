import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Connectors } from '@connectors/constants'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import AppDMonitoredSource from '../AppDMonitoredSource'
import { SourceData, AppTier, ApplicationName, MetricPack, ValidationData } from './AppDMonitoredSource.mock'

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
      sourceData: { sourceType: Connectors.APP_DYNAMICS },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

describe('Unit tests for createAppd monitoring source', () => {
  const refetchMock = jest.fn()

  beforeAll(() => {
    jest
      .spyOn(cvServices, 'useGetAppDynamicsTiers')
      .mockImplementation(() => ({ loading: false, error: null, data: AppTier, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetAppDynamicsApplications')
      .mockImplementation(() => ({ loading: false, error: null, data: ApplicationName, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: MetricPack, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'getAppDynamicsMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: ValidationData.data } as any))
  })

  test('Component renders in edit mode', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <AppDMonitoredSource data={SourceData} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('submit')).not.toBeNull())
    fireEvent.click(getByText('previous'))
    await waitFor(() =>
      expect(onPrevious).toHaveBeenCalledWith(
        expect.objectContaining({
          appDTier: 'manager',
          appdApplication: 'Harness-Dev',
          appdApplicationName: 'Harness-Dev',
          appdTierName: 'manager',
          metricAppD: {
            Errors: true,
            Performance: true
          },
          metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }]
        })
      )
    )

    fireEvent.click(getByText('submit'))
    await waitFor(() =>
      expect(submitData).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          environment: 'TestDemo101',
          identifier: 'AppD_101',
          name: 'AppD 101',
          service: 'TestDemo',
          spec: {
            appdApplicationName: 'Harness-Dev',
            appdTierName: 'manager',
            connectorRef: 'AppD_Connector_102',
            feature: 'Application Monitoring',
            metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }]
          },
          type: 'AppDynamics'
        })
      )
    )

    expect(container).toMatchSnapshot()
  })
})
