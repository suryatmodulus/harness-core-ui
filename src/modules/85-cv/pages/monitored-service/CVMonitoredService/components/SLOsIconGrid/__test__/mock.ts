import type { SloHealthIndicatorDTO } from 'services/cv'

export const items: SloHealthIndicatorDTO[] = [
  {
    serviceLevelObjectiveIdentifier: 'manager_http_errors',
    errorBudgetRemainingPercentage: 51.30434782608695,
    errorBudgetRisk: 'NEED_ATTENTION'
  },
  {
    serviceLevelObjectiveIdentifier: 'cvng_Slow_calls',
    errorBudgetRemainingPercentage: -71.99074074074075,
    errorBudgetRisk: 'UNHEALTHY'
  },
  {
    serviceLevelObjectiveIdentifier: 'slo',
    errorBudgetRemainingPercentage: -3111.8811881188117,
    errorBudgetRisk: 'HEALTHY'
  },
  {
    serviceLevelObjectiveIdentifier: 'slo-4',
    errorBudgetRemainingPercentage: -3111.8811881188117,
    errorBudgetRisk: 'OBSERVE'
  },
  {
    serviceLevelObjectiveIdentifier: 'slo-5',
    errorBudgetRemainingPercentage: 34.23,
    errorBudgetRisk: 'HEALTHY'
  }
]
