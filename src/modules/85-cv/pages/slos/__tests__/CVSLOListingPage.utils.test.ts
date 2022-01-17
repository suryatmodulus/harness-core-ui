/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import {
  getIsClearFilterDisabled,
  getIsMonitoresServicePageClearFilterDisabled,
  getServiceLevelObjectivesRiskCountParams,
  getSLODashboardWidgetsParams,
  getUserJourneyParams,
  initialState,
  SLODashboardFilterActions,
  sloFilterReducer
} from '../CVSLOListingPage.utils'
import { initialStateForDisableTest, pathParams } from './CVSLOsListingPage.mock'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('CVSLOListingPage.utils', () => {
  test('should check sloFilterReducer returning correct value for user journey filter', () => {
    expect(
      sloFilterReducer(
        initialState,
        SLODashboardFilterActions.updateUserJourney({ userJourney: { value: 'user1', label: 'user1' } })
      )
    ).toEqual({ ...initialState, userJourney: { value: 'user1', label: 'user1' } })
  })

  test('should check sloFilterReducer returning correct value for monitored services filter', () => {
    expect(
      sloFilterReducer(
        initialState,
        SLODashboardFilterActions.updateMonitoredServices({
          monitoredService: { value: 'service1', label: 'service1' }
        })
      )
    ).toEqual({ ...initialState, monitoredService: { value: 'service1', label: 'service1' } })
  })

  test('should check sloFilterReducer returning correct value for sli type filter', () => {
    expect(
      sloFilterReducer(
        initialState,
        SLODashboardFilterActions.updateSliType({
          sliTypes: { value: 'sli1', label: 'sli1' }
        })
      )
    ).toEqual({ ...initialState, sliTypes: { value: 'sli1', label: 'sli1' } })
  })
  test('should check sloFilterReducer returning correct value for target type filter', () => {
    expect(
      sloFilterReducer(
        initialState,
        SLODashboardFilterActions.updateTargetType({
          targetTypes: { value: 'target1', label: 'target1' }
        })
      )
    ).toEqual({ ...initialState, targetTypes: { value: 'target1', label: 'target1' } })
  })

  test('should check sloFilterReducer returning correct value for SLO risk filter', () => {
    expect(
      sloFilterReducer(
        initialState,
        SLODashboardFilterActions.updateSloRiskType({
          sloRiskFilter: { identifier: 'HEALTHY', displayColor: '#fff' }
        })
      )
    ).toEqual({ ...initialState, sloRiskFilter: { identifier: 'HEALTHY', displayColor: '#fff' } })
  })

  test('should check resetFiltersInMonitoredServicePage should not clear monitored services filter', () => {
    expect(
      sloFilterReducer(
        {
          ...initialState,
          monitoredService: {
            label: 'MyMS',
            value: 'MyMS'
          }
        },
        SLODashboardFilterActions.resetFiltersInMonitoredServicePageAction()
      )
    ).toEqual({
      ...initialState,
      monitoredService: {
        label: 'MyMS',
        value: 'MyMS'
      }
    })
  })

  test('should check sloFilterReducer resets the filters on reset action', () => {
    expect(sloFilterReducer(initialState, SLODashboardFilterActions.resetFilters())).toEqual(initialState)
  })

  test('should check getSLODashboardWidgetsParams returns correct output', () => {
    expect(getSLODashboardWidgetsParams(pathParams, getString, initialState, 1)).toEqual({
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountId: 'account_id',
        errorBudgetRisks: undefined,
        monitoredServiceIdentifier: 'All',
        orgIdentifier: 'org_identifier',
        pageNumber: 1,
        pageSize: 4,
        projectIdentifier: 'project_identifier',
        sliTypes: ['All'],
        targetTypes: ['All'],
        userJourneyIdentifiers: ['All']
      }
    })
  })
  test('should check getServiceLevelObjectivesRiskCountParams returns correct output', () => {
    expect(getServiceLevelObjectivesRiskCountParams(pathParams, getString, initialState)).toEqual({
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountId: 'account_id',
        monitoredServiceIdentifier: 'All',
        orgIdentifier: 'org_identifier',
        projectIdentifier: 'project_identifier',
        sliTypes: ['All'],
        targetTypes: ['All'],
        userJourneyIdentifiers: ['All']
      }
    })
  })
  test('should check getUserJourneyParams returns correct output', () => {
    expect(getUserJourneyParams(pathParams)).toEqual({
      queryParams: {
        accountId: 'account_id',
        offset: 0,
        orgIdentifier: 'org_identifier',
        pageSize: 100,
        projectIdentifier: 'project_identifier'
      }
    })
  })

  test('getIsClearFilterDisabled should return true if no filter is changed', () => {
    expect(getIsClearFilterDisabled(initialStateForDisableTest, getString)).toBeTruthy()
  })

  test('getIsClearFilterDisabled should return false if any of the filter is updated', () => {
    expect(
      getIsClearFilterDisabled(
        {
          ...initialStateForDisableTest,
          monitoredService: {
            label: 'MS',
            value: 'MS'
          }
        },
        getString
      )
    ).toBeFalsy()
  })
  test('getIsMonitoresServicePageClearFilterDisabled should return true though monitoredService filter got updated', () => {
    expect(
      getIsMonitoresServicePageClearFilterDisabled(
        {
          ...initialStateForDisableTest,
          monitoredService: {
            label: 'MS',
            value: 'MS'
          }
        },
        getString
      )
    ).toBeTruthy()
  })

  test('getIsMonitoresServicePageClearFilterDisabled should return false if other filter got changed', () => {
    expect(
      getIsMonitoresServicePageClearFilterDisabled(
        {
          ...initialStateForDisableTest,
          sliTypes: {
            label: 'MS',
            value: 'MS'
          }
        },
        getString
      )
    ).toBeFalsy()
  })
})
