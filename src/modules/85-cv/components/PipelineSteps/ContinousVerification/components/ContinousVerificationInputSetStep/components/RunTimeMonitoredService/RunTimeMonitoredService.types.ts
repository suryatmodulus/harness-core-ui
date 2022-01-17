/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import type { Sources } from 'services/cv'
export interface RunTimeMonitoredServiceProps {
  serviceIdentifier: string
  envIdentifier: string
  onUpdate?: (data: ContinousVerificationData) => void
  initialValues: ContinousVerificationData
  prefix: string
}
export interface MonitoringSourceData {
  monitoredService: {
    identifier: string
    name: string
    sources: Sources
  }
}
