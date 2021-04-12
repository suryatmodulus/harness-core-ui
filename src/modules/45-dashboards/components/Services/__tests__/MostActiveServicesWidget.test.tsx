import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { MostActiveServicesWidget } from '@dashboards/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
import { MostActiveServicesWidgetMock } from '@dashboards/mock'

describe('MostActiveServicesWidget', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <MostActiveServicesWidget {...MostActiveServicesWidgetMock} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
