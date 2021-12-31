import type { RiskCount, SLODashboardWidget } from 'services/cv'
import type { SLOWidgetData } from './SLOCard/SLOCardHeader.types'

export interface CVSLOsListingPageProps {
  monitoredServiceIdentifier?: string
}

// SLOCardHeader

export interface SLOCardHeaderProps {
  serviceLevelObjective: SLOWidgetData
  onDelete: (identifier: string, name: string) => void
  monitoredServiceIdentifier?: string
}

// SLOCardContent

export interface SLOCardContentProps {
  serviceLevelObjective: SLODashboardWidget
}

export enum SLOCardToggleViews {
  SLO = 'SLO',
  ERROR_BUDGET = 'ERROR_BUDGET'
}

export interface GetSLOAndErrorBudgetGraphOptions {
  minXLimit: number
  maxXLimit: number
  type: SLOCardToggleViews
  serviceLevelObjective: SLODashboardWidget
}

export type RiskTypes = 'HEALTHY' | 'OBSERVE' | 'NEED_ATTENTION' | 'UNHEALTHY' | 'EXHAUSTED'

export interface SLODashboardRiskCount {
  displayName?: string
  count?: number
  identifier?: RiskTypes
}

export interface SLORiskFilter extends RiskCount {
  displayColor: string
}

export type SLITypes = 'Availability' | 'Latency' | 'All'
export type SLITypesParams = 'Availability' | 'Latency'
export type TargetTypes = 'Rolling' | 'Calender' | 'All'
export type TargetTypesParams = 'Rolling' | 'Calender'
