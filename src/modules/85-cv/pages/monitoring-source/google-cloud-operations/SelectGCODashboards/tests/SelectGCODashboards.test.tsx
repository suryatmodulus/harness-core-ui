import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import * as cvService from 'services/cv'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { SelectGCODashboards } from '../SelectGCODashboards'
import { buildGCOMonitoringSourceInfo } from '../../GoogleCloudOperationsMonitoringSourceUtils'

const MockParams = {
  accountId: '1234_account',
  projectIdentifier: '1234_project',
  orgIdentifier: '1234_ORG'
}

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps }),
  pathParams: MockParams
}

const MockData = {
  data: {
    data: {
      content: [
        { name: 'CapabilityMismatchErrors', path: 'projects/674494598921/dashboards/10677345508806562647' },
        { name: ' Redis stress', path: 'projects/674494598921/dashboards/11281603920045896314' },
        { name: 'GCLB - Test', path: 'projects/674494598921/dashboards/1201721157960239302' },
        { name: 'QA-AccessLogs', path: 'projects/674494598921/dashboards/12415248476309631688' },
        {
          name: 'Database Issues - stress',
          path: 'projects/674494598921/dashboards/1438bc0d-41f1-476f-9430-5f4e3636fca0'
        },
        { name: 'Queues - QA', path: 'projects/674494598921/dashboards/14415235459248495942' },
        { name: 'CD', path: 'projects/674494598921/dashboards/14821685747839016814' },
        { name: 'Custom Dash - TimeScaleDB ', path: 'projects/674494598921/dashboards/15772748068262410069' },
        {
          name: ' Mongo Custom Metrics 3 - qa',
          path: 'projects/674494598921/dashboards/1c9d210e-7528-4487-87cc-d57d98b61307'
        },
        {
          name: 'Delegate Agent - qa',
          path: 'projects/674494598921/dashboards/1d8b73e6-bf1e-4230-8ea7-383664719591'
        }
      ],
      empty: false,
      pageIndex: 0,
      pageItemCount: 10,
      pageSize: 10,
      totalItems: 34,
      totalPages: 4
    }
  }
}

const MockData2ndPage = {
  data: {
    data: {
      content: [
        { name: 'MongoSomoething', path: 'projects/674494598921/dashboards/10677345508806562647' },
        { name: 'Another mongo something', path: 'projects/674494598921/dashboards/11281603920045896314' }
      ],
      empty: false,
      pageIndex: 1,
      pageItemCount: 2,
      pageSize: 10,
      totalItems: 34,
      totalPages: 4
    }
  }
}

describe('SelectGCODashboards unit tests', () => {
  test('When api returns nothing, ensure no data state is rendered', async () => {
    const refetchMock = jest.fn()
    const useGetStackdriverDashboardsMock = jest.spyOn(cvService, 'useGetStackdriverDashboards')
    useGetStackdriverDashboardsMock.mockReturnValue({
      loading: false,
      data: { data: { content: [] } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, unknown>)
    const { container, getAllByText } = render(
      <TestWrapper {...testWrapperProps}>
        <SelectGCODashboards
          data={buildGCOMonitoringSourceInfo(MockParams)}
          onNext={jest.fn()}
          onPrevious={jest.fn()}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="loadingErrorNoData"]')).not.toBeNull())

    fireEvent.click(getAllByText('cv.monitoringSources.gco.addManualInputQuery')[1])
    await waitFor(() => expect(document.body.querySelector('input[name="metricName"]')).not.toBeNull())
  })

  test('When api returns and error, ensure error state is rendered', async () => {
    const refetchMock = jest.fn()
    const useGetStackdriverDashboardsMock = jest.spyOn(cvService, 'useGetStackdriverDashboards')
    useGetStackdriverDashboardsMock.mockReturnValue({
      loading: false,
      data: undefined,
      error: { data: { message: 'mock_error' } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, unknown>)
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SelectGCODashboards
          data={buildGCOMonitoringSourceInfo(MockParams)}
          onNext={jest.fn()}
          onPrevious={jest.fn()}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="loadingErrorNoData"]')).not.toBeNull())

    const retryButton = container.querySelector('button')
    if (!retryButton) {
      throw Error('Could not find dashboards to render')
    }
    fireEvent.click(retryButton)
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })

  test('When api returns data, ensure data is rendered correctly', async () => {
    const useGetStackdriverDashboardsMock = jest.spyOn(cvService, 'useGetStackdriverDashboards')
    useGetStackdriverDashboardsMock.mockImplementation(({ queryParams }) => {
      if (queryParams?.offset === 0) {
        return MockData as UseGetReturn<any, any, any, any>
      } else {
        return MockData2ndPage as UseGetReturn<any, any, any, unknown>
      }
    })

    const onSubmitFunc = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <SelectGCODashboards
          data={buildGCOMonitoringSourceInfo(MockParams)}
          onNext={onSubmitFunc}
          onPrevious={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container).toMatchSnapshot()

    const rows = container.querySelectorAll('div[role="row"]')
    expect(rows.length).toBe(11)

    fireEvent.click(rows[2])
    await waitFor(() => expect(container.querySelectorAll('input[checked=""]').length).toBe(1))

    const checkedBox = container.querySelector('input[type="checkbox"]')
    if (!checkedBox) {
      throw Error('checkbox was not rendered.')
    }
    fireEvent.click(checkedBox)
    await waitFor(() => expect(container.querySelectorAll('input[checked=""]').length).toBe(2))

    fireEvent.click(getByText('2'))
    await waitFor(() => expect(container.querySelectorAll('div[role="row"]').length).toBe(3))

    fireEvent.click(getByText('Next'))
    await waitFor(() =>
      expect(onSubmitFunc).toHaveBeenCalledWith({
        accountId: '1234_account',
        identifier: 'MyGoogleCloudOperationsSource',
        name: 'MyGoogleCloudOperationsSource',
        orgIdentifier: '1234_ORG',
        product: 'Cloud Metrics',
        projectIdentifier: '1234_project',
        selectedDashboards: [
          {
            name: ' Redis stress',
            path: 'projects/674494598921/dashboards/11281603920045896314'
          },
          {
            name: 'CapabilityMismatchErrors',
            path: 'projects/674494598921/dashboards/10677345508806562647'
          }
        ],
        selectedMetrics: new Map(),
        type: 'STACKDRIVER'
      })
    )
  })
})
