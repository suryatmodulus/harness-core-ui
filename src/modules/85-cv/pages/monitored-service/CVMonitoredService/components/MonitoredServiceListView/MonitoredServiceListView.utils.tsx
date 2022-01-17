/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import { FilterTypes } from '../../CVMonitoredService.types'

export const getListTitle = (
  getString: UseStringsReturn['getString'],
  type: FilterTypes,
  serviceCount: number
): string => {
  // Replace if with switch while adding more cases
  if (type === FilterTypes.RISK) {
    return getString('cv.monitoredServices.showingServiceAtRisk', { serviceCount })
  }

  return getString('cv.monitoredServices.showingAllServices', { serviceCount })
}
