import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ServicesHeader } from '@dashboards/components/Services/ServicesHeader/ServicesHeader'

describe('ServiceHeader', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServicesHeader />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
