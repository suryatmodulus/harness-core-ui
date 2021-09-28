import type { Options } from 'highcharts'

export type NetworkgraphOptions = Omit<Options, 'type'>

export interface Node {
  id: string
  status: string
  icon: string
}

export interface GraphData {
  from: string
  to: string
}

export type DependencyData = {
  data: GraphData[]
  nodes: Node[]
}
