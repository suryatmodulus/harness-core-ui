import type { Chart, Options } from 'highcharts'
import type { Edge, ServiceSummaryDetails } from 'services/cv'

export type NetworkgraphOptions = Omit<Options, 'type'>
export interface Node {
  icon?: string
  name: string
  id: string
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
}

export interface IconDetails {
  x: string
  y: string
  width: number
  height: number
}
