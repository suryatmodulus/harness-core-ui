import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { initialState } from '@cv/pages/slos/CVSLOListingPage.utils'
import SLODashbordFilters from '../SLODashbordFilters'
import { filterItemData } from './SLODashbordFilters.mock'

describe('SLODashbordFilters', () => {
  test('should have all the filters', () => {
    render(
      <TestWrapper>
        <SLODashbordFilters
          filterState={initialState}
          dispatch={jest.fn()}
          hideMonitoresServicesFilter={false}
          filterItemsData={filterItemData}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId(/userJourney-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/monitoredServices-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/sloTargetAndBudget-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/sliType-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/filter-reset/)).toBeInTheDocument()
    expect(screen.queryByTestId(/filter-reset-monitored-services/)).not.toBeInTheDocument()
  })
  test('should not have monitored services filter in monitores services page', () => {
    render(
      <TestWrapper>
        <SLODashbordFilters
          filterState={initialState}
          dispatch={jest.fn()}
          hideMonitoresServicesFilter={true}
          filterItemsData={filterItemData}
        />
      </TestWrapper>
    )

    expect(screen.getByTestId(/userJourney-filter/)).toBeInTheDocument()
    expect(screen.queryByTestId(/monitoredServices-filter/)).not.toBeInTheDocument()
    expect(screen.getByTestId(/sloTargetAndBudget-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/sliType-filter/)).toBeInTheDocument()
    expect(screen.getByTestId(/filter-reset-monitored-services/)).toBeInTheDocument()
    expect(screen.queryByTestId(/filter-reset$/)).not.toBeInTheDocument()
  })
})
