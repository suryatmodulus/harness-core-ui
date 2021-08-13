import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { Services } from '../Services'

jest.mock('highcharts-react-official', () => () => <></>)

jest.mock('services/cd-ng', () => {
  return {
    useGetServiceDeploymentsInfo: jest.fn,
    useGetWorkloads: jest.fn,
    useGetServicesGrowthTrend: jest.fn,
    useGetServiceDetails: jest.fn
  }
})

describe('Services', () => {
  test('should render Services', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <Services />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
