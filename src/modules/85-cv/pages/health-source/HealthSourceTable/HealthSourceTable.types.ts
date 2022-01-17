/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Dispatch, SetStateAction } from 'react'
import type { ChangeSourceDTO, MonitoredServiceResponse } from 'services/cv'
import type { MonitoredServiceRef } from '@cv/pages/monitored-service/components/Configurations/components/Service/Service.types'
import type { RowData } from '../HealthSourceDrawer/HealthSourceDrawerContent.types'

export interface HealthSourceTableInterface {
  value: Array<RowData>
  breadCrumbRoute?: {
    routeTitle: string
  }
  monitoredServiceRef: MonitoredServiceRef
  serviceRef: string
  environmentRef: string
  onSuccess: (value: MonitoredServiceResponse) => void
  isEdit?: boolean
  shouldRenderAtVerifyStep?: boolean
  isRunTimeInput?: boolean
  onCloseDrawer?: Dispatch<SetStateAction<boolean>>
  validMonitoredSource?: boolean
  validateMonitoredSource?: () => void
  changeSources?: ChangeSourceDTO[]
}
