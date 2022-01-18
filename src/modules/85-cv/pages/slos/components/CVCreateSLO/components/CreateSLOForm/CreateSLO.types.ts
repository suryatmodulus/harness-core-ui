/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { SLIMetricSpec, SLOTargetSpec } from 'services/cv'
import type { SLITypeEnum } from './components/SLI/SLI.constants'
import type { Comparators } from './components/SLI/SLI.types'

export interface SLOForm {
  name: string
  identifier: string
  description?: string
  tags?: { [key: string]: string }
  userJourneyRef: string
  monitoredServiceRef: string
  healthSourceRef: string
  serviceLevelIndicators: {
    type: SLITypeEnum
    spec: {
      type?: 'Threshold' | 'Ratio'
      spec: SLIMetricSpec
      objectiveValue?: number
      comparator?: Comparators
    }
  }
  target: {
    type?: 'Rolling' | 'Calender'
    sloTargetPercentage: number
    spec: SLOTargetSpec
  }
}

export interface CreateSLOFormProps {
  formikProps: FormikProps<SLOForm>
  identifier?: string
}
