import React from 'react'
import { render } from '@testing-library/react'
import { Connectors } from '@connectors/constants'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import NewRelicHealthSourceContainer from '../NewRelicHealthSourceContainer'
import NewRelicHealthSoure from '../NewRelicHealthSource'
import { metricPack, applicationData, sourceData, newrelicInput } from './NewRelic.mock'

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
      sourceData: { sourceType: Connectors.NEW_RELIC },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

describe('Unit tests for NewRelic health source', () => {
  const refetchMock = jest.fn()

  beforeAll(() => {
    jest
      .spyOn(cvServices, 'useGetNewRelicApplications')
      .mockImplementation(
        () => ({ loading: false, error: null, data: { ...applicationData.data }, refetch: refetchMock } as any)
      )
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: { ...metricPack }, refetch: refetchMock } as any))
    jest.spyOn(cvServices, 'getNewRelicMetricDataPromise').mockImplementation(() => ({ error: null, data: {} } as any))
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Test NewRelic healthSource container loads', () => {
    const submitData = jest.fn()
    const { container } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <NewRelicHealthSourceContainer data={null} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Test NewRelic healthSource component', async () => {
    const submitData = jest.fn()
    const { container } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{ ...sourceData }} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <NewRelicHealthSoure data={newrelicInput} onSubmit={submitData} onPrevious={() => onPrevious(sourceData)} />
        </SetupSourceTabs>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
