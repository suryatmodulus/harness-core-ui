/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Chart, Options } from 'highcharts'
import type { Edge, ServiceSummaryDetails } from 'services/cv'

export type NetworkgraphOptions = Omit<Options, 'type'>
export interface Node {
  icon?: string
  name?: string
  id?: string
  serviceRef?: string
  environmentRef?: string
  status: ServiceSummaryDetails['riskLevel']
}

export interface GraphData {
  from: string
  to: string
}

export type DependencyData = {
  data?: Edge[]
  nodes?: Node[]
}

export interface DependencyGraphProps {
  dependencyData: DependencyData
  options?: NetworkgraphOptions
  highchartsCallback?: (chart: Chart) => void
  containerClassName?: string
}

export interface IconDetails {
  x: string
  y: string
  width: number
  height: number
}
