/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import { MetricTypes } from './MetricsAnalysisContainer.types'

export const metricTypeOptions = (getString: UseStringsReturn['getString']): SelectOption[] => [
  {
    label: getString('cv.allMetrics'),
    value: ''
  },
  {
    label: getString('pipeline.verification.anomalousMetrics'),
    value: MetricTypes.ANOMALOUS
  }
]

export const PAGE_SIZE = 10
