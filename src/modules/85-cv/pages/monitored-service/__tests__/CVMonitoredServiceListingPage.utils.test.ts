import type { RiskData } from 'services/cv'
import { HistoricalTrendChartOption } from '../CVMonitoredServiceListingPage.constants'
import { createTrendDataWithZone, getHistoricalTrendChartOption } from '../CVMonitoredServiceListingPage.utils'

const trendChartMockData: RiskData[] = [
  { healthScore: 2, riskStatus: 'LOW' },
  { healthScore: 4, riskStatus: 'LOW' },
  { healthScore: 8, riskStatus: 'MEDIUM' },
  { healthScore: 16, riskStatus: 'HIGH' }
]
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
})
