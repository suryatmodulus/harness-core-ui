import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ActiveServiceInstancesHeader } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesHeader'
import * as cdngServices from 'services/cd-ng'

jest.mock('highcharts-react-official', () => () => <></>)

jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummary').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetInstanceGrowthTrend').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

describe('ActiveServiceInstancesHeader', () => {
  test('should render ActiveServiceInstancesHeader', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancesHeader />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
