/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { deploymentStatsSummaryResponse } from '../mocks'
import LandingDashboardDeploymentsWidget from '../LandingDashboardDeploymentsWidget'

jest.mock('services/dashboard-service', () => ({
  useGetDeploymentStatsOverview: jest.fn().mockImplementation(() => {
    return { data: deploymentStatsSummaryResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('LandingDashboardDeploymentsWidget tests', () => {
  test('cd dashboard charts should render properly', async () => {
    const { getByText } = render(
      <TestWrapper path={routes.toLandingDashboard({ accountId: ':accountId' })} pathParams={{ accountId: 'dummy' }}>
        <LandingDashboardDeploymentsWidget />
      </TestWrapper>
    )

    // expect(container).toMatchSnapshot()

    // const pendingApprovalsBadge = getByText('4 Pending Approvals')
    // expect(pendingApprovalsBadge).toBeInTheDocument()
    // const pendingManualInterventionsBadge = getByText('1 Pending Manual Interventions')
    // expect(pendingManualInterventionsBadge).toBeInTheDocument()

    const deploymentStatsSummaryCard = getByText('deploymentsText')
    expect(deploymentStatsSummaryCard).toBeInTheDocument()
    const failureRateSummaryCard = getByText('common.failureRate')
    expect(failureRateSummaryCard).toBeInTheDocument()
    const deploymentFrequencySummaryCard = getByText('pipeline.deploymentFrequency')
    expect(deploymentFrequencySummaryCard).toBeInTheDocument()

    const mostActiveServicesTitle = getByText('common.mostActiveServices')
    expect(mostActiveServicesTitle).toBeInTheDocument()

    const successLegendText = getByText('Success (5)')
    expect(successLegendText).toBeInTheDocument()
    const failedLegendText = getByText('Failed (2)')
    expect(failedLegendText).toBeInTheDocument()
  })
})
