import type { UseStringsReturn } from 'framework/strings'
import type { TransactionMetric } from 'services/cv'

export function getRiskDisplayName(
  risk: TransactionMetric['risk'],
  getString: UseStringsReturn['getString']
): string | undefined {
  return risk
}
