import React from 'react'
import { render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
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

describe('Unit tests for HealthScoreChart', () => {
  test('Verify if all the fields are rendered correctly inside HealthScoreChart', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv').mockReturnValue({
      data: mockedHealthScoreData,
      refetch: fetchHealthScore as unknown
    } as UseGetReturn<any, any, any, any>)
    const props = {
      envIdentifier: '1234_env',
      serviceIdentifier: '1234_service',
      duration: TimePeriodEnum.TWENTY_FOUR_HOURS
    }
    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('Ensure that api is called with endtime', async () => {
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv').mockReturnValue({
      data: mockedHealthScoreData,
      refetch: fetchHealthScore as unknown
    } as UseGetReturn<any, any, any, any>)
    render(
      <WrapperComponent
        envIdentifier="1234_env"
        serviceIdentifier="1234_service"
        duration={TimePeriodEnum.TWENTY_FOUR_HOURS}
        endTime={23234}
      />
    )

    await waitFor(() =>
      expect(cvService.useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv).toHaveBeenLastCalledWith({
        lazy: true,
        queryParams: {
          accountId: undefined,
          duration: 'TWENTY_FOUR_HOURS',
          endTime: 23234,
          environmentIdentifier: '1234_env',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          serviceIdentifier: '1234_service'
        }
      })
    )
  })

  test('Verify if correct series is returned for the health score bar graph', async () => {
    expect(getSeriesData(mockedHealthScoreData.healthScores as cvService.RiskData[])).toEqual(mockedSeriesData)
  })
})
