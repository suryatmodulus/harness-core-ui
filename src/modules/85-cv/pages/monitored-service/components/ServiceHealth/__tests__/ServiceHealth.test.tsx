import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { StringKeys } from 'framework/strings'
import ServiceHealth from '../ServiceHealth'
import { getTimeFormat, getTimeInHrs, getTimePeriods, getTimestampsForPeriod } from '../ServiceHealth.utils'
import type { ServiceHealthProps } from '../ServiceHealth.types'
import { NUMBER_OF_DATA_POINTS, TimePeriodEnum } from '../ServiceHealth.constants'
import { mockedHealthScoreData, timePeriodsMockData } from './ServiceHealth.mock'

const WrapperComponent = (props: ServiceHealthProps): JSX.Element => {
  return (
    <TestWrapper>
      <ServiceHealth {...props} />
    </TestWrapper>
  )
}

function getString(key: StringKeys): StringKeys {
  return key
}

const fetchHealthScore = jest.fn()
jest.mock('highcharts-react-official', () => () => <></>)

jest.mock('services/cv', () => ({
  useGetMonitoredServiceScoresFromServiceAndEnvironment: jest.fn().mockImplementation(() => ({
    data: { currentHealthScore: { riskStatus: 'LOW', healthScore: 100 } },
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetMonitoredServiceOverAllHealthScore: jest.fn().mockImplementation(() => {
    return { data: mockedHealthScoreData, refetch: fetchHealthScore, error: null, loading: false }
  })
}))

describe('Unit tests for ServiceHealth', () => {
  test('Verify if all the fields are rendered correctly inside ServiceHealth', async () => {
    const props = { serviceIdentifier: 'service-identifier', environmentIdentifier: 'env-identifier' }
    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('Verify if getTimeInHrs method gives correct results', async () => {
    expect(getTimeInHrs(TimePeriodEnum.FOUR_HOURS)).toEqual(4)
    expect(getTimeInHrs(TimePeriodEnum.TWENTY_FOUR_HOURS)).toEqual(24)
    expect(getTimeInHrs(TimePeriodEnum.THREE_DAYS)).toEqual(24 * 3)
    expect(getTimeInHrs(TimePeriodEnum.SEVEN_DAYS)).toEqual(24 * 7)
    expect(getTimeInHrs(TimePeriodEnum.THIRTY_DAYS)).toEqual(24 * 30)
    expect(getTimeInHrs('default')).toEqual(24)
  })

  test('Verify if getTimePeriods method gives correct data', async () => {
    expect(getTimePeriods(getString)).toEqual(timePeriodsMockData)
  })

  test('Verify if correct number of data points are returned from getTimestampsForPeriod method', async () => {
    const timeLineDataPoints = getTimestampsForPeriod(TimePeriodEnum.FOUR_HOURS)
    expect(timeLineDataPoints).toHaveLength(NUMBER_OF_DATA_POINTS)
  })

  test('Verify if correct timeformat is returned from getTimeFormat method', async () => {
    expect(getTimeFormat(TimePeriodEnum.FOUR_HOURS)).toEqual('hours')
    expect(getTimeFormat(TimePeriodEnum.TWENTY_FOUR_HOURS)).toEqual('hours')
    expect(getTimeFormat(TimePeriodEnum.THREE_DAYS)).toEqual('days')
    expect(getTimeFormat(TimePeriodEnum.SEVEN_DAYS)).toEqual('days')
    expect(getTimeFormat(TimePeriodEnum.THIRTY_DAYS)).toEqual('days')
    expect(getTimeFormat('default')).toEqual('hours')
  })
})
