/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import type { CustomHealthMetricDefinition, TimestampInfo } from 'services/cv'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'

export interface CustomHealthSourceSetupSource {
  isEdit: boolean
  mappedServicesAndEnvs: Map<string, MapCustomHealthToService> // metricName to MapCustomHealthToService
  healthSourceIdentifier: string
  healthSourceName: string
  connectorRef?: string
}

export type MapCustomHealthToService = {
  metricName: string
  metricIdentifier: string
  groupName?: SelectOption

  baseURL: string
  pathURL: string
  queryType: CustomHealthMetricDefinition['queryType']
  query: string
  requestMethod: CustomHealthMetricDefinition['method']
  metricValue: string
  timestamp: string
  timestampFormat: string
  serviceInstancePath: string

  startTime: TimestampInfo
  endTime: TimestampInfo

  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  riskCategory?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  serviceInstanceIdentifier?: string
}

export type SelectedAndMappedMetrics = {
  selectedMetric: string
  mappedMetrics: Map<string, MapCustomHealthToService>
}

export type CreatedMetricsWithSelectedIndex = {
  createdMetrics: string[]
  selectedMetricIndex: number
}

export interface onSubmitCustomHealthSourceInterface {
  formikProps: FormikProps<MapCustomHealthToService | undefined>
  createdMetrics: string[]
  selectedMetricIndex: number
  mappedMetrics: Map<string, MapCustomHealthToService>
  selectedMetric: string
  onSubmit: (formdata: CustomHealthSourceSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
  sourceData: any
  transformedSourceData: CustomHealthSourceSetupSource
  getString: UseStringsReturn['getString']
}
