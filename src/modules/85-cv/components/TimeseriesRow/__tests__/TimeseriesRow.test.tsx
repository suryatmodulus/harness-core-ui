import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { render } from '@testing-library/react'
import TimeseriesRow, { useTimeseriesDetailsModal, extractTimeRange, SeriesConfig } from '../TimeseriesRow'

jest.mock('@wings-software/uicore', () => ({
  ...(jest.requireActual('@wings-software/uicore') as any),
  useModalHook: (callback: () => React.ReactNode) => [callback, jest.fn()]
}))

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: () => 'xx'
  })
}))

jest.mock('highcharts-react-official', () => () => <div />)

describe('TimeseriesRow', () => {
  test('matches snapshot', () => {
    const { container } = render(
      <TimeseriesRow
        transactionName="transaction1"
        metricName="metric1"
        seriesData={[
          {
            name: 'node1',
            series: []
          }
        ]}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('matches snapshot when config is passed', () => {
    const { container } = render(
      <TimeseriesRow
        transactionName="transaction1"
        metricName="metric1"
        seriesData={[
          {
            name: 'node1',
            series: []
          }
        ]}
        chartOptions={{
          chart: {
            height: 90
          }
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('useTimeseriesDetailsModal returns Dialog handler', () => {
    const timestamp = 1607094947608
    const { result } = renderHook(() => useTimeseriesDetailsModal('transaction1', 'metric1', 'APP_DYNAMICS'))
    const r: any = result.current({
      name: 'testNode',
      series: [
        {
          type: 'line',
          data: [
            [timestamp + 5 * 60000, 100],
            [timestamp + 13 * 60000, 200]
          ]
        }
      ]
    })
    expect(r.type.name).toEqual('Dialog')
  })

  test('extractTimeRange finds min/max dates', () => {
    const timestamp = 1607094947608
    const testSeriesConfig: SeriesConfig = {
      name: 'testNode',
      series: [
        {
          type: 'line',
          data: [
            {
              x: timestamp + 2 * 60000,
              y: 22
            },
            {
              x: timestamp + 10 * 60000,
              y: 33
            }
          ]
        },
        {
          type: 'line',
          data: [
            [timestamp + 5 * 60000, 100],
            [timestamp + 13 * 60000, 200]
          ]
        }
      ]
    }
    let range = extractTimeRange(testSeriesConfig)
    expect(range).toBeDefined()
    expect(range?.startDate).toEqual(timestamp + 2 * 60000)
    expect(range?.endDate).toEqual(timestamp + 13 * 60000)

    range = extractTimeRange(testSeriesConfig, {
      xAxis: {
        min: timestamp,
        max: timestamp + 10 * 60000
      }
    })
    expect(range).toBeDefined()
    expect(range?.startDate).toEqual(timestamp)
    expect(range?.endDate).toEqual(timestamp + 10 * 60000)

    range = extractTimeRange({
      name: 'test',
      series: [
        {
          type: 'line',
          data: []
        }
      ]
    })
    expect(range).not.toBeDefined()
  })
})
