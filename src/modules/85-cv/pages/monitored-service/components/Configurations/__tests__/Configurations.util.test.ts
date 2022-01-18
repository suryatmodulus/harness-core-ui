/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { clone, omit } from 'lodash-es'
import { isUpdated, determineUnSaveState, onSubmit } from '../Configurations.utils'
import { monitoredService } from './Configurations.mock'

const cachedInitialValues = clone(monitoredService)
cachedInitialValues.dependencies = []
const dirtyFormik = { current: { dirty: true } as any }
const cleanFormik = { current: { dirty: false } as any }
const dependencyTab = 'pipelines-studio.dependenciesGroupTitle'
const serviceTab = 'service'
const saveMonitoredService = jest.fn()
const updateMonitoredService = jest.fn()
const fetchMonitoredService = jest.fn()
const setOverrideBlockNavigation = jest.fn()
describe('Validate configuration tab util function', () => {
  test('validate isUpdated ', () => {
    expect(isUpdated(false, monitoredService, null)).toEqual(false)
    expect(isUpdated(false, monitoredService, monitoredService)).toEqual(false)
    expect(isUpdated(false, monitoredService, cachedInitialValues)).toEqual(true)
  })

  test('validate determineUnSaveState', () => {
    const changeInDependencyTab = determineUnSaveState({
      cachedInitialValues,
      initialValues: monitoredService,
      overrideBlockNavigation: false,
      isExactPath: false,
      selectedTabID: dependencyTab,
      serviceTabformRef: cleanFormik,
      dependencyTabformRef: dirtyFormik,
      getString: val => val
    })
    expect(changeInDependencyTab).toEqual(true)
    const changeInServiceTab = determineUnSaveState({
      cachedInitialValues,
      initialValues: monitoredService,
      overrideBlockNavigation: false,
      isExactPath: false,
      selectedTabID: serviceTab,
      serviceTabformRef: dirtyFormik,
      dependencyTabformRef: cleanFormik,
      getString: val => val
    })
    expect(changeInServiceTab).toEqual(true)
    const nonDirtyFormsWithCacheData = determineUnSaveState({
      cachedInitialValues,
      initialValues: monitoredService,
      overrideBlockNavigation: false,
      isExactPath: false,
      selectedTabID: serviceTab,
      serviceTabformRef: cleanFormik,
      dependencyTabformRef: cleanFormik,
      getString: val => val
    })
    expect(nonDirtyFormsWithCacheData).toEqual(true)
    const noChange = determineUnSaveState({
      cachedInitialValues: monitoredService,
      initialValues: monitoredService,
      overrideBlockNavigation: false,
      isExactPath: false,
      selectedTabID: serviceTab,
      serviceTabformRef: cleanFormik,
      dependencyTabformRef: cleanFormik,
      getString: val => val
    })
    expect(noChange).toEqual(false)
  })

  test('validate onSubmit', async () => {
    // Edit Case
    await onSubmit({
      formikValues: monitoredService,
      identifier: 'monitoredService',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      cachedInitialValues: monitoredService,
      updateMonitoredService,
      saveMonitoredService,
      fetchMonitoredService,
      setOverrideBlockNavigation
    })
    const updatePayload = omit(monitoredService, 'isEdit')
    expect(updateMonitoredService).toHaveBeenCalledWith({ ...updatePayload })
    expect(fetchMonitoredService).toHaveBeenCalled()

    // Create Case
    await onSubmit({
      formikValues: monitoredService,
      identifier: '',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      cachedInitialValues: monitoredService,
      updateMonitoredService,
      saveMonitoredService,
      fetchMonitoredService,
      setOverrideBlockNavigation
    })
    const createPayload = omit(monitoredService, 'isEdit')
    expect(saveMonitoredService).toHaveBeenCalledWith({ ...createPayload })
    expect(setOverrideBlockNavigation).toHaveBeenCalled()
  })
})
