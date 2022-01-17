/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { FormikProps } from 'formik'
import type { DatadogMetricInfo } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.type'

export interface DatadogMetricsDetailsContentProps {
  selectedMetric?: string
  selectedMetricData?: DatadogMetricInfo
  metricHealthDetailsData: Map<string, DatadogMetricInfo>
  setMetricHealthDetailsData: React.Dispatch<React.SetStateAction<Map<string, DatadogMetricInfo>>>
  formikProps: FormikProps<DatadogMetricInfo>
  metricTags: string[]
  activeMetrics: string[]
}
