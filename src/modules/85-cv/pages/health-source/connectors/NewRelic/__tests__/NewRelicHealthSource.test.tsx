import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Connectors } from '@connectors/constants'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import NewRelicHealthSourceContainer from '../NewRelicHealthSourceContainer'
import {
  metricPack,
  applicationData,
  sourceData,
  validationData,
  onPreviousPayload,
  onSubmitPayload
} from './NewRelic.mock'

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
      .mockImplementation(() => ({ loading: false, error: null, data: applicationData, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: metricPack, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'getNewRelicMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: validationData.data } as any))
  })

  test('Test NewRelic healthSource container loads', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <NewRelicHealthSourceContainer data={sourceData} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('submit')).not.toBeNull())
    fireEvent.click(getByText('previous'))
    await waitFor(() => expect(onPrevious).toHaveBeenCalledWith(expect.objectContaining(onPreviousPayload)))

    fireEvent.click(getByText('submit'))
    await waitFor(() =>
      expect(submitData).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(onSubmitPayload))
    )

    expect(container).toMatchSnapshot()
  })
})
