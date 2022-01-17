/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import type { MonitoredServiceResponse, HealthSource } from 'services/cv'

export const updateMonitoredServiceData = (
  initialValues: ContinousVerificationData,
  onUpdate?: (data: any) => void,
  monitoredServiceData?: MonitoredServiceResponse
): void => {
  const healthSources =
    monitoredServiceData?.monitoredService?.sources?.healthSources?.map(el => {
      return { identifier: (el as HealthSource)?.identifier }
    }) || []

  const newMonitoredServiceData = {
    monitoredServiceRef: monitoredServiceData?.monitoredService?.name,
    healthSources: healthSources as { identifier: string }[]
  }

  onUpdate?.({
    ...initialValues,
    spec: {
      ...initialValues?.spec,
      ...newMonitoredServiceData,
      spec: { ...initialValues.spec.spec }
    }
  })
}
