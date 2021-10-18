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

    const successLegendText = getByText('Success')
    expect(successLegendText).toBeInTheDocument()
    const failedLegendText = getByText('Failed')
    expect(failedLegendText).toBeInTheDocument()
  })
})
