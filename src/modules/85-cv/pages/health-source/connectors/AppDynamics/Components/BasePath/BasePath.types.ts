export interface BasePathData {
  [key: string]: { value: string; path: string }
}

export interface BasePathInterface {
  connectorIdentifier: string
  appName: string
  basePathValue: BasePathData
  onChange: (key: string, value: BasePathData) => void
}
