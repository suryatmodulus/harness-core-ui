import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SLOCardContent from '../SLOCard/SLOCardContent'
import { testWrapperProps, dashboardWidgetsContent } from './CVSLOsListingPage.mock'

jest.mock('@cv/pages/slos/SLOCard/ErrorBudgetGauge', () => ({
  __esModule: true,
  default: function ErrorBudgetGauge() {
    return <span data-testid="error-budget-gauge" />
  }
}))

describe('SLOCardContent', () => {
  test('Toggle the SLO and Error budget', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOCardContent serviceLevelObjective={dashboardWidgetsContent} />
      </TestWrapper>
    )

    expect(screen.getAllByText('cv.SLO')[0]).toHaveClass('PillToggle--selected')
    expect(screen.getByText('cv.errorBudget')).not.toHaveClass('PillToggle--selected')
    expect(screen.getByText('cv.SLOPerformanceTrend')).toBeInTheDocument()
    expect(screen.queryByText('cv.sloRecalculationInProgress')).not.toBeInTheDocument()

    userEvent.click(screen.getByText('cv.errorBudget'))

    expect(screen.queryByTestId('error-budget-gauge')).toBeInTheDocument()
    expect(screen.getAllByText('cv.SLO')[0]).not.toHaveClass('PillToggle--selected')
    expect(screen.getByText('cv.errorBudget')).toHaveClass('PillToggle--selected')
    expect(screen.getByText('cv.errorBudgetRemaining')).toBeInTheDocument()
    expect(screen.getByText('cv.errorBudgetBurnDown')).toBeInTheDocument()

    userEvent.click(screen.getByText('cv.SLO'))

    expect(screen.getAllByText('cv.SLO')[0]).toHaveClass('PillToggle--selected')
  })

  test('it should show the SLI recalculation in progress warning', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOCardContent serviceLevelObjective={{ ...dashboardWidgetsContent, recalculatingSLI: true }} />
      </TestWrapper>
    )

    expect(screen.getByText('cv.sloRecalculationInProgress')).toBeInTheDocument()
  })
})
