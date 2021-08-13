import React from 'react'
import { cloneDeep } from 'lodash-es'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import * as cvService from 'services/cv'
import { DeploymentMetrics } from '../DeploymentMetrics'
import { MetricTypeOptions } from '../DeploymentMetrics.constants'

const ApiResponse = {
  metaData: {},
  resource: {
    pageResponse: {
      totalPages: 4,
      totalItems: 42,
      pageItemCount: 0,
      pageSize: 10,
      content: [
        {
          transactionMetric: {
            transactionName: 'Internal Server Error : 500',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'HIGH',
              score: 0.0,
              controlData: [2.6666666666666665, 3.0, 3.0, 2.6666666666666665, 3.0],
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            },
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [144.66666666666666, 171.33333333333334, 171.33333333333334, 172.0, 170.66666666666666],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'ConcurrentModificationException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [4.666666666666667, 6.0, 6.0, 6.0, 5.333333333333333],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'RuntimeException : FileSystemException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [2.6666666666666665, 3.0, 3.0, 3.0, 2.6666666666666665],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'SocketTimeoutException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [
                2.6666666666666665, 3.3333333333333335, 3.3333333333333335, 3.6666666666666665, 3.6666666666666665
              ],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'RuntimeException : FileNotFoundException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [2.6666666666666665, 3.0, 3.0, 2.6666666666666665, 3.0],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: '/todolist/requestLogin',
            metricName: 'Average Response Time (ms)',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [1.6666666666666667, 1.0, 1.0, 1.0, 1.0],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'RuntimeException : IOException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [2.6666666666666665, 3.0, 2.6666666666666665, 3.0, 3.0],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: '/todolist/inside',
            metricName: 'Calls per Minute',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [138.33333333333334, 148.0, 152.33333333333334, 145.66666666666666, 152.66666666666666],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'RuntimeException : InterruptedException',
            metricName: 'Number of Errors',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [2.3333333333333335, 3.0, 3.0, 3.0, 3.0],
              anomalous: false
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: '/todolist/inside',
            metricName: 'Stall Count',
            score: 0.0,
            risk: 'NO_DATA'
          },
          connectorName: 'CV-AH-AppDynamics-QA',
          nodes: [
            {
              hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
              risk: 'NO_DATA',
              score: 0.0,
              controlData: null,
              testData: [0.0, 0.0, 0.0, 0.0, 0.0],
              anomalous: false
            }
          ]
        }
      ],
      pageIndex: 0,
      empty: false
    },
    deploymentTimeRange: { startTime: '2021-06-08 20:34:00', endTime: '2021-06-08 20:49:00' },
    deploymentStartTime: 1623184440000,
    deploymentEndTime: 1623185340000
  },
  responseMessages: []
}

const DataSourceTypesResponse = {
  resource: [
    {
      dataSourceType: 'APP_DYNAMICS',
      verificationType: 'TIME_SERIES'
    },
    {
      dataSourceType: 'SPLUNK',
      verificationType: 'LOG'
    },
    {
      dataSourceType: 'STACKDRIVER',
      verificationType: 'TIME_SERIES'
    }
  ]
}

const MockExecutionNode: ExecutionNode = {
  progressData: {
    activityId: '1234_activityId' as any
  },
  status: 'Failed',
  stepParameters: {
    environmentIdentifier: '1234_env' as any,
    serviceIdentifier: '1234_service' as any
  }
} as ExecutionNode

describe('Unit tests for Deployment metrics', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  test('Ensure api is called with non anomalous filter', async () => {
    const useGetDatasourceTypesSpy = jest.spyOn(cvService, 'useGetDataSourcetypes').mockReturnValue({
      data: DataSourceTypesResponse,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const useGetDeploymentMetricsSpy = jest.spyOn(cvService, 'useGetDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(useGetDatasourceTypesSpy).toHaveBeenCalled()
    expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
      activityId: '1234_activityId',
      queryParams: {
        accountId: undefined,
        anomalousMetricsOnly: false,
        hostName: undefined,
        pageNumber: 0,
        pageSize: 10
      }
    })

    const [anomalousFilter, healthSourceFilter] = container.querySelectorAll('[class*="maxDropDownWidth"]')

    // select anomalous filter
    fireEvent.click(anomalousFilter.querySelector('[data-icon="chevron-down"]')!)
    await waitFor(() => expect(document.querySelector('[class*="menuItem"]')).not.toBeNull())
    fireEvent.click(getByText(MetricTypeOptions[1].label))

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        activityId: '1234_activityId',
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: true,
          hostName: undefined,
          pageNumber: 0,
          pageSize: 10
        }
      })
    )

    // select stackdriver health source
    fireEvent.click(healthSourceFilter.querySelector('[data-icon="chevron-down"]')!)
    await waitFor(() => expect(document.querySelector('[class*="menuItem"]')).not.toBeNull())
    fireEvent.click(getByText('Google Cloud Operations (Metrics)'))

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        activityId: '1234_activityId',
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: true,
          healthSource: 'STACKDRIVER',
          hostName: undefined,
          pageNumber: 0,
          pageSize: 10
        }
      })
    )
  })

  test('Ensure api is called with filter and selected page', async () => {
    jest.spyOn(cvService, 'useGetDataSourcetypes').mockReturnValue({
      data: DataSourceTypesResponse,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const useGetDeploymentMetricsSpy = jest.spyOn(cvService, 'useGetDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // add a filter
    fireEvent.click(container.querySelector('[class*="filterBy"] input')!)
    fireEvent.change(container.querySelector('[class*="filterBy"] input')!, { target: { value: 'sdfsfd' } })
    jest.runTimersToTime(1000)

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        activityId: '1234_activityId',
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: false,
          filter: 'sdfsfd',
          hostName: undefined,
          pageNumber: 0,
          pageSize: 10
        }
      })
    )

    // click on a page
    const pageButtons = container.querySelectorAll('[class*="Pagination--container"] .bp3-button-text')
    fireEvent.click(pageButtons[2])

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        activityId: '1234_activityId',
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: false,
          filter: 'sdfsfd',
          pageNumber: 2,
          hostName: undefined,
          pageSize: 10
        }
      })
    )
  })

  test('Ensure loading state is rendered', async () => {
    jest.spyOn(cvService, 'useGetDataSourcetypes').mockReturnValue({
      data: DataSourceTypesResponse,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetDeploymentMetrics').mockReturnValue({
      loading: true,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="loading"]')).not.toBeNull())
  })

  test('Ensure error state is rendred', async () => {
    jest.spyOn(cvService, 'useGetDataSourcetypes').mockReturnValue({
      data: DataSourceTypesResponse,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetDeploymentMetrics').mockReturnValue({
      error: { data: { message: 'mockError' } } as any,
      refetch: refetchFn as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    getByText('mockError')

    fireEvent.click(getByText('Retry'))
    await waitFor(() => expect(refetchFn).toHaveBeenCalledTimes(1))
  })

  test('Ensure no data state is rendered', async () => {
    jest.spyOn(cvService, 'useGetDataSourcetypes').mockReturnValue({
      data: DataSourceTypesResponse,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetDeploymentMetrics').mockReturnValue({
      data: { resource: { content: [] } } as any,
      refetch: refetchFn as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(getByText('pipeline.verification.noMetrics')).not.toBeNull()
  })

  test('Ensure that when new activityId is passed as prop view is reset', async () => {
    jest.spyOn(cvService, 'useGetDataSourcetypes').mockReturnValue({
      data: DataSourceTypesResponse,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const refetchFn = jest.fn()
    const useGetDeploymentMetricsSpy = jest.spyOn(cvService, 'useGetDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: refetchFn as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container, rerender } = render(
      <TestWrapper>
        <DeploymentMetrics
          step={MockExecutionNode}
          activityId={MockExecutionNode!.progressData!.activityId as unknown as string}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
      activityId: '1234_activityId',
      queryParams: {
        accountId: undefined,
        anomalousMetricsOnly: false,
        hostName: undefined,
        pageNumber: 0,
        pageSize: 10
      }
    })

    // click on a page
    const pageButtons = container.querySelectorAll('[class*="Pagination--container"] .bp3-button-text')
    fireEvent.click(pageButtons[3])

    await waitFor(() =>
      expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
        activityId: '1234_activityId',
        queryParams: {
          accountId: undefined,
          anomalousMetricsOnly: false,
          pageNumber: 3,
          hostName: undefined,
          pageSize: 10
        }
      })
    )

    const clonedStep = cloneDeep(MockExecutionNode)
    clonedStep.progressData!.activityId = '12312_activityId' as any
    rerender(
      <TestWrapper>
        <DeploymentMetrics step={clonedStep} activityId={clonedStep!.progressData!.activityId as unknown as string} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(useGetDeploymentMetricsSpy).toHaveBeenLastCalledWith({
      activityId: '12312_activityId',
      queryParams: {
        accountId: undefined,
        anomalousMetricsOnly: false,
        hostName: undefined,
        pageNumber: 0,
        pageSize: 10
      }
    })
  })

  test('Ensure polling works correctly', async () => {
    jest.spyOn(cvService, 'useGetDataSourcetypes').mockReturnValue({
      data: DataSourceTypesResponse,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const refetchFn = jest.fn()
    const clonedNode = cloneDeep(MockExecutionNode)
    clonedNode.status = 'Running'

    jest.spyOn(cvService, 'useGetDeploymentMetrics').mockReturnValue({
      data: ApiResponse,
      refetch: refetchFn as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <DeploymentMetrics step={clonedNode} activityId={clonedNode!.progressData!.activityId as unknown as string} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // for next call
    const clonedResponse = cloneDeep(ApiResponse)
    clonedResponse.resource.pageResponse.content = [
      {
        transactionMetric: {
          transactionName: '/todolist/inside',
          metricName: 'Stall Count',
          score: 0.0,
          risk: 'NO_DATA'
        },
        connectorName: 'CV-AH-AppDynamics-QA',
        nodes: [
          {
            hostName: 'harness-test-appd-ng-demo-deployment-canary-84dfb494bf-7w5sx',
            risk: 'NO_DATA',
            score: 0.0,
            controlData: null,
            testData: [0.0, 0.0, 0.0, 0.0, 0.0],
            anomalous: false
          }
        ]
      }
    ]

    jest.spyOn(cvService, 'useGetDeploymentMetrics').mockReturnValue({
      data: clonedResponse,
      refetch: refetchFn as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.runTimersToTime(20000)
    await waitFor(() => expect(refetchFn).toHaveBeenCalledTimes(1))
  })
})
