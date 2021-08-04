import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import { ServiceInstancesWidget } from '@cd/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import { serviceInstances } from '@cd/mock'

jest.mock('highcharts-react-official', () => () => <></>)

jest.spyOn(cdngServices, 'useGetServicesGrowthTrend').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

describe('ServiceInstancesWidget', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServiceInstancesWidget {...serviceInstances} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
