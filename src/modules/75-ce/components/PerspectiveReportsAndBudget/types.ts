import type { Budget } from 'services/ce'

export interface BudgetStepData extends Budget {
  perspective: string
  perspectiveName: string
  budgetName: string
}
