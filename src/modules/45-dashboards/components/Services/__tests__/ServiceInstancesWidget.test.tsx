import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ServiceInstancesWidget } from '@dashboards/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import { ServiceInstancesWidgetMock } from '@dashboards/mock'

jest.mock('highcharts-react-official', () => () => <></>)

describe('ServiceInstancesWidget', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServiceInstancesWidget {...ServiceInstancesWidgetMock} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
