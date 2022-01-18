/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import type { ChangeSourceDTO, HealthSource, MonitoredServiceResponse } from 'services/cv'
import { useStrings } from 'framework/strings'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import HealthSourceTable from './HealthSourceTable'
import HealthSourceDrawerHeader from '../HealthSourceDrawer/component/HealthSourceDrawerHeader/HealthSourceDrawerHeader'
import HealthSourceDrawerContent from '../HealthSourceDrawer/HealthSourceDrawerContent'
import type { RowData } from '../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { createHealthsourceList } from './HealthSourceTable.utils'

interface VerifyStepHealthSourceTableInterface {
  serviceIdentifier: string
  envIdentifier: string
  healthSourcesList: RowData[]
  monitoredServiceRef: { identifier: string; name: string }
  onSuccess: (data: any) => void
  isRunTimeInput: boolean
  changeSourcesList: ChangeSourceDTO[]
}

export default function VerifyStepHealthSourceTable(tableProps: VerifyStepHealthSourceTableInterface) {
  const { getString } = useStrings()

  const {
    serviceIdentifier,
    envIdentifier,
    healthSourcesList,
    changeSourcesList,
    monitoredServiceRef,
    isRunTimeInput,
    onSuccess
  } = tableProps
  const {
    showDrawer: showHealthSourceDrawer,
    hideDrawer: hideHealthSourceDrawer,
    setDrawerHeaderProps
  } = useDrawer({
    createHeader: props => <HealthSourceDrawerHeader {...props} />,
    createDrawerContent: props => <HealthSourceDrawerContent {...props} />
  })

  const healthSourceDrawerHeaderProps = useCallback(
    (isEdit = false) => {
      return {
        isEdit,
        shouldRenderAtVerifyStep: true,
        onClick: () => hideHealthSourceDrawer(),
        breadCrumbRoute: { routeTitle: getString('connectors.cdng.runTimeMonitoredService.backToRunPipeline') }
      }
    },
    [serviceIdentifier, envIdentifier, healthSourcesList, monitoredServiceRef, isRunTimeInput]
  )

  const getHealthSourceDrawerProps = useCallback(
    (values?: any) => {
      return {
        isRunTimeInput,
        shouldRenderAtVerifyStep: true,
        serviceRef: serviceIdentifier,
        environmentRef: envIdentifier,
        monitoredServiceRef: monitoredServiceRef,
        rowData: values,
        tableData: values ? createHealthsourceList(healthSourcesList, values) : healthSourcesList,
        changeSources: changeSourcesList,
        onSuccess: (data: MonitoredServiceResponse) => {
          onSuccess(data)
          hideHealthSourceDrawer()
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      serviceIdentifier,
      envIdentifier,
      healthSourcesList,
      monitoredServiceRef.name,
      monitoredServiceRef.identifier,
      isRunTimeInput
    ]
  )

  const onEdit = useCallback(
    values => {
      const drawerProps = getHealthSourceDrawerProps(values)
      showHealthSourceDrawer(drawerProps)
      setDrawerHeaderProps?.(healthSourceDrawerHeaderProps(true))
    },
    [
      serviceIdentifier,
      envIdentifier,
      healthSourcesList,
      monitoredServiceRef.identifier,
      monitoredServiceRef.name,
      isRunTimeInput
    ]
  )

  const onAddNewHealthSource = useCallback(() => {
    const drawerProps = getHealthSourceDrawerProps()
    showHealthSourceDrawer(drawerProps)
    setDrawerHeaderProps?.(healthSourceDrawerHeaderProps())
  }, [
    serviceIdentifier,
    envIdentifier,
    healthSourcesList,
    monitoredServiceRef.identifier,
    monitoredServiceRef.name,
    isRunTimeInput
  ])
  return (
    <>
      <HealthSourceTable
        onEdit={onEdit}
        isRunTimeInput={isRunTimeInput}
        onAddNewHealthSource={onAddNewHealthSource}
        value={healthSourcesList as HealthSource[]}
        shouldRenderAtVerifyStep
        onSuccess={data => {
          onSuccess(data)
          hideHealthSourceDrawer()
        }}
      />
    </>
  )
}
