import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { RiskData } from 'services/cv'
import HealthScoreChart from '../HealthScoreChart'
import type { HealthScoreChartProps } from '../HealthScoreChart.types'
import { TimePeriodEnum } from '../../../ServiceHealth.constants'
import { mockedHealthScoreData, mockedSeriesData } from './HealthScoreChart.mock'
import { getSeriesData } from '../HealthScoreChart.utils'

const WrapperComponent = (props: HealthScoreChartProps): JSX.Element => {
  return (
    <TestWrapper>
      <HealthScoreChart {...props} />
    </TestWrapper>
  )
}

const fetchHealthScore = jest.fn()

jest.mock('services/cv', () => ({
  useGetMonitoredServiceOverAllHealthScore: jest.fn().mockImplementation(() => {
    return { data: mockedHealthScoreData, refetch: fetchHealthScore, error: null, loading: false }
  })
}))

describe('Unit tests for HealthScoreChart', () => {
  test('Verify if all the fields are rendered correctly inside HealthScoreChart', async () => {
    const props = {
      monitoredServiceIdentifier: 'monitored-service-1',
      duration: { value: TimePeriodEnum.TWENTY_FOUR_HOURS, label: '24 Hours' }
    }
    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('Verify if correct series is returned for the health score bar graph', async () => {
    expect(getSeriesData(mockedHealthScoreData.healthScores as RiskData[])).toEqual(mockedSeriesData)
  })
})
