import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { RestResponseTransactionMetricInfoSummaryPageDTO } from 'services/cv'
import TimeseriesRow from '@cv/components/TimeseriesRow/TimeseriesRow'
import DeploymentMetricsTab from '../DeploymentMetricsTab'

jest.mock('@cv/components/TimeseriesRow/TimeseriesRow', () => jest.fn().mockImplementation((_props: any) => <div />))

const dataMock: RestResponseTransactionMetricInfoSummaryPageDTO = {
  resource: {
    pageResponse: {
      totalPages: 1,
      totalItems: 10,
      pageItemCount: 0,
      pageSize: 10,
      content: [
        {
          transactionMetric: {
            transactionName: 'RuntimeException',
            metricName: 'Number of Errors',
            score: 0
          },
          connectorName: 'appd2',
          nodes: [
            {
              hostName: undefined,
              risk: 'LOW',
              score: 0,
              controlData: [],
              testData: [130, 692, 718, 703, 687]
            }
          ]
        },
        {
          transactionMetric: {
            transactionName: 'RuntimeException',
            metricName: 'Number of Errors',
            score: 0
          },
          connectorName: 'appd2',
          nodes: [
            {
              hostName: undefined,
              risk: 'LOW',
              score: 0,
              controlData: [130],
              testData: [130]
            }
          ]
        }
      ],
      pageIndex: 0,
      empty: false
    },
    deploymentStartTime: 1609422672601,
    deploymentEndTime: 1609426272601
  }
}

describe('DeploymentMetricsTab', () => {
  test('Matches snapshot and calculates data correctly', () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentMetricsTab
          data={dataMock}
          goToPage={jest.fn()}
          onAnomalousMetricsOnly={jest.fn()}
          isLoading={false}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect((TimeseriesRow as any).mock.calls[0][0].seriesData[0].series[0].data).toMatchSnapshot()
    expect((TimeseriesRow as any).mock.calls[0][0].seriesData[0].chartOptions.yAxis.tickPositions).toEqual([
      130, 326, 522, 718
    ])
  })
})
