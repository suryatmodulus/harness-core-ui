import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Table } from '@common/components'
import type { RiskData } from 'services/cv'
import {
  rowData,
  changeSummary,
  changeSummaryWithNegativeChange,
  changeSummaryWithPositiveChange
} from './MonitoreService.mock'
import { HistoricalTrendChartOption, DefaultChangePercentage } from '../CVMonitoredServiceListingPage.constants'
import {
  RenderTags,
  RenderHealthScore,
  RenderHealthTrend,
  createTrendDataWithZone,
  getHistoricalTrendChartOption,
  calculateChangePercentage
} from '../CVMonitoredServiceListingPage.utils'

const trendChartMockData: RiskData[] = [
  { healthScore: 2, riskStatus: 'LOW' },
  { healthScore: 4, riskStatus: 'LOW' },
  { healthScore: 8, riskStatus: 'MEDIUM' },
  { healthScore: 16, riskStatus: 'HIGH' }
]

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (val: string) => val
  })
}))
describe('Test util functions', () => {
  test('validare createTrendDataWithZone', () => {
    const trendSeries = createTrendDataWithZone(trendChartMockData)
    const { data, zones } = trendSeries
    expect(data).toEqual([
      { x: 0, y: 2 },
      { x: 1, y: 4 },
      { x: 2, y: 8 },
      { x: 3, y: 16 }
    ])
    expect(zones).toEqual([
      {
        color: 'var(--green-500)',
        value: 2
      },
      {
        color: 'var(--orange-500)',
        value: 3
      },
      {
        color: 'var(--red-500)',
        value: undefined
      }
    ])

    const trendChartOption = getHistoricalTrendChartOption(trendChartMockData)
    expect(trendChartOption).toEqual({
      ...HistoricalTrendChartOption,
      series: [{ ...trendSeries }]
    })
  })

  test('calculateChangePercentage should return correct output', () => {
    // Change summary is empty
    const outputWithEmptyObject = calculateChangePercentage({})
    expect(outputWithEmptyObject).toEqual(DefaultChangePercentage)
    // With zero values for all changes
    const outputWithDefaultObject = calculateChangePercentage(changeSummary)
    expect(outputWithDefaultObject).toEqual(DefaultChangePercentage)

    const outputWithPositiveValue = calculateChangePercentage(changeSummaryWithPositiveChange)
    expect(outputWithPositiveValue).toEqual({
      color: 'success',
      percentage: 20
    })

    const outputWithNegativeObject = calculateChangePercentage(changeSummaryWithNegativeChange)
    expect(outputWithNegativeObject).toEqual({
      color: 'error',
      percentage: 20
    })
  })

  test('should render tags', async () => {
    const { container, getByText } = render(
      <Table
        sortable={true}
        columns={[
          {
            Header: 'RenderHealthTrend',
            width: '20%',
            Cell: RenderHealthTrend
          },
          {
            Header: 'RenderHealthScore',
            width: '20%',
            Cell: RenderHealthScore
          },
          {
            Header: 'RenderTags',
            width: '10%',
            Cell: RenderTags
          }
        ]}
        data={[rowData.original]}
      />
    )

    await waitFor(() => expect(container.querySelector('.highcharts-container')).toBeTruthy())
    await waitFor(() => expect(getByText('cv.monitoredServices.riskLabel.mediumRisk')).toBeTruthy())
    await waitFor(() => expect(getByText('tag1')).toBeTruthy())
    await waitFor(() => expect(getByText('tag2')).toBeTruthy())
    await waitFor(() => expect(getByText('tag3')).toBeTruthy())
  })
})
