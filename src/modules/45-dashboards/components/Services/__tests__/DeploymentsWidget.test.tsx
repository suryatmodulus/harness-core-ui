import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentsWidget } from '@dashboards/components/Services/DeploymentsWidget/DeploymentsWidget'
import { DeploymentsWidgetMock } from '@dashboards/mock'

jest.mock('highcharts-react-official', () => () => <></>)

describe('DeploymentsWidget', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <DeploymentsWidget {...DeploymentsWidgetMock} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
