import React, { useCallback, useMemo } from 'react'
import { Button, ButtonVariation, Layout, Select, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { SLODashbordFiltersProps } from './SLODashboardFilters.types'
import {
  getIsClearFilterDisabled,
  getIsMonitoresServicePageClearFilterDisabled,
  getMonitoredServicesOptionsForFilter,
  getPeriodTypeOptionsForFilter,
  getSliTypeOptionsForFilter,
  getUserJourneyOptionsForFilter,
  SLODashboardFilterActions
} from '../../CVSLOListingPage.utils'
import css from '../../CVSLOsListingPage.module.scss'

const SLODashbordFilters: React.FC<SLODashbordFiltersProps> = ({
  filterState,
  dispatch,
  filterItemsData,
  hideMonitoresServicesFilter
}) => {
  const { getString } = useStrings()

  const resetFilters = useCallback(() => {
    dispatch(SLODashboardFilterActions.resetFilters())
  }, [])

  const resetFiltersInMonitoredServicePage = useCallback(() => {
    dispatch(SLODashboardFilterActions.resetFiltersInMonitoredServicePageAction())
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hideResetFilterButton = useMemo(() => getIsClearFilterDisabled(filterState, getString), [filterState])

  const hideMonitoredServiceResetButton = useMemo(
    () => getIsMonitoresServicePageClearFilterDisabled(filterState, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterState]
  )

  const { updateUserJourney, updateMonitoredServices, updateTargetType, updateSliType } = SLODashboardFilterActions

  return (
    <Layout.Horizontal margin={{ bottom: 'medium' }} className={css.sloFilters}>
      <Layout.Vertical width="180px" margin={{ right: 'small' }} data-testid="userJourney-filter">
        <Text>{getString('cv.slos.userJourney')}</Text>
        <Select
          value={filterState.userJourney}
          items={getUserJourneyOptionsForFilter(filterItemsData.userJourney?.data?.content, getString)}
          onChange={item => {
            dispatch(updateUserJourney({ userJourney: item }))
          }}
        />
      </Layout.Vertical>
      {!hideMonitoresServicesFilter && (
        <Layout.Vertical width="180px" margin={{ right: 'small' }} data-testid="monitoredServices-filter">
          <Text>{getString('cv.monitoredServices.title')}</Text>
          <Select
            value={filterState.monitoredService}
            items={getMonitoredServicesOptionsForFilter(filterItemsData.monitoredServices, getString)}
            onChange={item => {
              dispatch(updateMonitoredServices({ monitoredService: item }))
            }}
          />
        </Layout.Vertical>
      )}
      <Layout.Vertical width="180px" margin={{ right: 'small' }} data-testid="sloTargetAndBudget-filter">
        <Text>{getString('cv.slos.sloTargetAndBudget.periodType')}</Text>
        <Select
          value={filterState.targetTypes}
          items={getPeriodTypeOptionsForFilter(getString)}
          onChange={item => {
            dispatch(updateTargetType({ targetTypes: item }))
          }}
        />
      </Layout.Vertical>
      <Layout.Vertical width="180px" margin={{ right: 'small' }} data-testid="sliType-filter">
        <Text>{getString('cv.slos.sliType')}</Text>
        <Select
          value={filterState.sliTypes}
          items={getSliTypeOptionsForFilter(getString)}
          onChange={item => {
            dispatch(updateSliType({ sliTypes: item }))
          }}
        />
      </Layout.Vertical>
      {!hideMonitoresServicesFilter && !hideResetFilterButton && (
        <Button
          className={css.clearButton}
          variation={ButtonVariation.LINK}
          onClick={resetFilters}
          data-testid="filter-reset"
        >
          {getString('common.filters.clearFilters')}
        </Button>
      )}
      {hideMonitoresServicesFilter && !hideMonitoredServiceResetButton && (
        <Button
          className={css.clearButton}
          variation={ButtonVariation.LINK}
          onClick={resetFiltersInMonitoredServicePage}
          data-testid="filter-reset-monitored-services"
        >
          {getString('common.filters.clearFilters')}
        </Button>
      )}
    </Layout.Horizontal>
  )
}

export default SLODashbordFilters
