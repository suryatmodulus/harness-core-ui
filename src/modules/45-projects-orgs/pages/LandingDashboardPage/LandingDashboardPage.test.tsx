import { render } from '@testing-library/react'
import React from 'react'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import LandingDashboardPage from './LandingDashboardPage'

describe('Landing Dashboard Page', () => {
  test('render', async () => {
    const { findByText } = render(
      <TestWrapper path={routes.toLandingDashboard({ accountId: ':accountId' })} pathParams={{ accountId: 'dummy' }}>
        <LandingDashboardPage />
      </TestWrapper>
    )

    expect(findByText('projectsOrgs.landingDashboard.welcomeMessageWithoutName')).toBeDefined()
    expect(findByText('projectsOrgs.welcomeSecondLine')).toBeDefined()
    expect(findByText('projectLabel')).toBeDefined()
  })
})
