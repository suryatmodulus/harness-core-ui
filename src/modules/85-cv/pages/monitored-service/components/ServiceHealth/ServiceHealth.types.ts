export interface TickerType {
  percentage: number
  label: string
  count: number
  id: number
}

export interface ServiceHealthProps {
  monitoredServiceIdentifier?: string
  serviceIdentifier: string
  environmentIdentifier: string
}
