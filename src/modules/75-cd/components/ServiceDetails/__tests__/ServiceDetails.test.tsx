import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ServiceDetails from '@cd/components/ServiceDetails/ServiceDetails'
import * as cdngServices from 'services/cd-ng'

jest.mock('highcharts-react-official', () => () => <></>)

jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummary').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
  return {
    mutate: () => Promise.resolve({ loading: true, data: [] })
  } as any
})

jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetInstanceGrowthTrend').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetInstanceCountHistory').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

describe('ServiceDetails', () => {
  test('should render ServiceDetails', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServiceDetails />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
