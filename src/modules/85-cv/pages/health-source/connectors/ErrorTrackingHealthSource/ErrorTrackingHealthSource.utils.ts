/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { HealthSourceTypes } from '../../types'
import type { ErrorTrackingHealthSourceForm, ErrorTrackingHealthSourcePayload } from './ErrorTrackingSource.types'

export const ErrorTrackingProductNames = {
  LOGS: 'Error Tracking Logs'
}

export function createErrorTrackingHealthSourcePayload(
  formData: ErrorTrackingHealthSourceForm
): ErrorTrackingHealthSourcePayload {
  return {
    name: formData?.healthSourceName,
    identifier: formData?.healthSourceIdentifier,
    type: HealthSourceTypes.ErrorTracking,
    spec: {
      connectorRef: formData.connectorRef,
      feature: formData.product.value.toString()
    }
  }
}
