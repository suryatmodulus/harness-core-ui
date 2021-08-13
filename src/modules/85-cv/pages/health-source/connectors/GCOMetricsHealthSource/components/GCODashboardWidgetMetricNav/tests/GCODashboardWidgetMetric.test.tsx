import React from 'react'
import { waitFor, render, fireEvent } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { Classes } from '@blueprintjs/core'
import * as cvService from 'services/cv'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { GCODashboardWidgetMetricNav } from '../GCODashboardWidgetMetricNav'
import { FieldNames, MANUAL_INPUT_QUERY } from '../../ManualInputQueryModal/ManualInputQueryModal'

const MockDashboards: cvService.StackdriverDashboardDTO[] = [
  {
    name: 'dashboard_1',
    path: '/dashboard_1/12'
  },
  {
    name: 'dashboard_2',
    path: '/dashboard_2/23'
  }
]

const MockWidgetResponse: cvService.StackdriverDashboardDetail[] = [
  {
    widgetName: 'widget_1',
    dataSetList: [
      {
        metricName: 'metric_1',
        timeSeriesQuery: { query: '234242' }
      },
      {
        metricName: 'metric_2',
        timeSeriesQuery: { query: '345345345' }
      },
      {
        metricName: 'metric_3',
        timeSeriesQuery: { query: '7578768678' }
      }
    ]
  },
  {
    widgetName: 'bad_widget'
  },
  {
    dataSetList: []
  },
  {
    widgetName: 'widget_2',
    dataSetList: [
      {
        metricName: 'metric_4',
        timeSeriesQuery: { query: '5654grt46' }
      }
    ]
  }
]

const MockWidgetResponse2: cvService.StackdriverDashboardDetail[] = [
  {
    widgetName: 'widget_3',
    dataSetList: [
      {
        metricName: 'metric_5',
        timeSeriesQuery: { query: '9sd9f80' }
      }
    ]
  }
]

const MockConnectorIdentifier = '1234_connectorIdentifier'

describe('unit tests for dashboard widget metric', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test(' Ensure content is rendered', async () => {
    const useGetStackdriverDashboardDetailSpy = jest.spyOn(cvService, 'useGetStackdriverDashboardDetail')
    useGetStackdriverDashboardDetailSpy.mockReturnValue({
      data: { data: MockWidgetResponse },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)
    const mockMetricSelect = jest.fn()
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <GCODashboardWidgetMetricNav
          gcoDashboards={MockDashboards}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={mockMetricSelect}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(getByText('widget_1')).not.toBeNull()
    const firstMetric = getByText('metric_2')
    expect(firstMetric).not.toBeNull()

    if (!firstMetric) {
      throw Error('First metric was not rendered.')
    }
    fireEvent.click(firstMetric)
    await waitFor(() => expect(mockMetricSelect).toHaveBeenCalledTimes(2))
    expect(mockMetricSelect).toHaveBeenNthCalledWith(
      1,
      MockWidgetResponse[0]?.dataSetList?.[0].metricName,
      JSON.stringify(MockWidgetResponse[0]?.dataSetList?.[0].timeSeriesQuery),
      MockWidgetResponse[0]?.widgetName,
      MockDashboards[0].name,
      '/dashboard_1/12'
    )

    const secondDashboard = container.querySelectorAll(`li.${Classes.TREE_NODE} .bp3-tree-node-content svg`)
    useGetStackdriverDashboardDetailSpy.mockReturnValue({
      data: { data: MockWidgetResponse2 },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)
    expect(secondDashboard.length).toBe(5)
    fireEvent.click(secondDashboard[4])

    await waitFor(() => expect(getByText(MockWidgetResponse2[0]?.widgetName as string)).not.toBeNull())
  })

  test('Ensure that when error and no data happens, the component handels it correctly', async () => {
    const useGetStackdriverDashboardDetailSpy = jest.spyOn(cvService, 'useGetStackdriverDashboardDetail')
    useGetStackdriverDashboardDetailSpy.mockReturnValue({
      error: { data: { detailedMessage: 'mock error' } } as unknown,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <GCODashboardWidgetMetricNav
          gcoDashboards={MockDashboards}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={jest.fn()}
        />
      </TestWrapper>
    )

    // error case validation, ensure toaster is displayed
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await waitFor(() => expect(getByText('mock error')).not.toBeNull())

    // no data validation
    useGetStackdriverDashboardDetailSpy.mockReturnValue({
      data: {} as unknown,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)

    await waitFor(() =>
      expect(container.querySelectorAll(`.${Classes.TREE_NODE_LIST}.${Classes.TREE_ROOT} li`).length).toBe(3)
    )

    expect(container.querySelectorAll(`${Classes.TREE_NODE_LIST}`)[1]?.children.length).toBeUndefined()
  })

  test('Ensure that when manual input query is selected and entered, it shows up in the nav', async () => {
    const useGetStackdriverDashboardDetailSpy = jest.spyOn(cvService, 'useGetStackdriverDashboardDetail')
    useGetStackdriverDashboardDetailSpy.mockReturnValue({
      data: { data: MockWidgetResponse },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)
    const mockMetricSelect = jest.fn()
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <GCODashboardWidgetMetricNav
          gcoDashboards={MockDashboards}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={mockMetricSelect}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // click on manual input query and expect modal to appear
    fireEvent.click(getByText('cv.monitoringSources.gco.addManualInputQuery'))
    await waitFor(() => expect(document.body.querySelector(`input[name="${FieldNames.METRIC_NAME}"]`)).not.toBeNull())

    // fill out value and submit modal
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: FieldNames.METRIC_NAME,
      value: 'solo-dolo'
    })

    const submitButton = document.body.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('submit button not rendered')
    }
    fireEvent.click(submitButton)

    // expect selected metric prop to be called and the manual input query to be selected
    await waitFor(() => expect(document.body.querySelector(`[class*="${Classes.DIALOG_HEADER}"]`)))
    expect(mockMetricSelect).toHaveBeenNthCalledWith(2, 'solo-dolo', MANUAL_INPUT_QUERY, '', '', '')
    expect(container.querySelector(`.${Classes.TREE_NODE_SELECTED} p`)?.innerHTML).toEqual('solo-dolo')
  })

  test('Ensure that when s', async () => {
    const useGetStackdriverDashboardDetailSpy = jest.spyOn(cvService, 'useGetStackdriverDashboardDetail')
    useGetStackdriverDashboardDetailSpy.mockReturnValue({
      data: { data: MockWidgetResponse },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)
    const mockMetricSelect = jest.fn()

    const { container } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <GCODashboardWidgetMetricNav
          gcoDashboards={MockDashboards}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={mockMetricSelect}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
  })

  test('Ensure that when only manual input query is provided, it is properly selected in the nav', async () => {
    const useGetStackdriverDashboardDetailSpy = jest.spyOn(cvService, 'useGetStackdriverDashboardDetail')
    useGetStackdriverDashboardDetailSpy.mockReturnValue({
      data: { data: MockWidgetResponse },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, unknown>)
    const mockMetricSelect = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <GCODashboardWidgetMetricNav
          gcoDashboards={[]}
          manuallyInputQueries={['solo-dolo', 'semi-auto']}
          connectorIdentifier={MockConnectorIdentifier}
          onSelectMetric={mockMetricSelect}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('ul[class*="bp3-tree-node-list"][class*="root"]')?.children.length).toBe(1)
    expect(container.querySelector('ul li[class*="expanded"]')).not.toBeNull()
    expect(mockMetricSelect).toHaveBeenNthCalledWith(1, 'solo-dolo', MANUAL_INPUT_QUERY, '', '', '')
    expect(container.querySelector('li[class*="selected"] p')?.innerHTML).toEqual('solo-dolo')
  })
})
