import type { AnalyzedLogDataDTO } from 'services/cv'

export function roundOffRiskScore(log: AnalyzedLogDataDTO): number {
  return (
    log?.logData?.riskScore && log?.logData?.riskScore % 1 !== 0
      ? log?.logData?.riskScore?.toFixed(1)
      : log?.logData?.riskScore
  ) as number
}
