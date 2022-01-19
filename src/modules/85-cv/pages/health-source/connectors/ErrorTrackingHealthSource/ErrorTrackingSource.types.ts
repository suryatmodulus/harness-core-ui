/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { ErrorTrackingHealthSourceSpec } from 'services/cv'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { HealthSourceTypes } from '../../types'

export interface ErrorTrackingHealthSourcePayload {
  name: string
  identifier: string
  type: HealthSourceTypes.ErrorTracking
  spec: ErrorTrackingHealthSourceSpec
}

export interface ErrorTrackingHealthSourceForm {
  isEdit: boolean
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  connectorRef: string
  sourceType: HealthSourceTypes.ErrorTracking
}

export interface ErrorTrackingHealthSourceProps {
  data: any
  onSubmit: (formdata: ErrorTrackingHealthSourceForm, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}
