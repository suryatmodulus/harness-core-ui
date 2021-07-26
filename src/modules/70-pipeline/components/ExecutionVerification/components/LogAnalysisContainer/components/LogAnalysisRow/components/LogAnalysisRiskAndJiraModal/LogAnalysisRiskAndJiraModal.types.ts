export interface LogAnalysisRiskAndJiraModalProps {
  count: number
  activityType?: string
  trendData?: Highcharts.Options
  onHide: (data?: any) => void
  logMessage: string
  feedback?: { risk: string; message?: string }
}

export interface DataNameAndDataProps {
  dataName: string
  data?: string | number
}

export interface RiskAndMessageFormProps {
  handleSubmit: () => void
  hasSubmitted?: boolean
}

export interface ActivityHeadingContentProps {
  count: number
  trendData?: Highcharts.Options
}

export interface SampleDataProps {
  logMessage?: string
}
