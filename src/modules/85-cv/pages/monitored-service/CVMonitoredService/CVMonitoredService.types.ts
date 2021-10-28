import type { MutateMethod } from 'restful-react'
import type { Color, FontVariation } from '@wings-software/uicore'
import type {
  MonitoredServiceListItemDTO,
  RestResponseHealthMonitoringFlagResponse,
  SetHealthMonitoringFlagQueryParams,
  SetHealthMonitoringFlagPathParams,
  PageMonitoredServiceListItemDTO,
  RiskData
} from 'services/cv'
import type { FilterCardItem } from '@cv/components/FilterCard/FilterCard.types'
import type { DependencyData } from '@cv/components/DependencyGraph/DependencyGraph.types'

export interface FilterEnvInterface {
  searchTerm?: string
  environmentIdentifier?: string
}

export interface ContextMenuActionsProps {
  onEdit?(): void
  onDelete?(): void
  titleText: string
  contentText: string | JSX.Element
  confirmButtonText?: string
  deleteLabel?: string
  editLabel?: string
}

export type setHealthMonitoringFlagType = MutateMethod<
  RestResponseHealthMonitoringFlagResponse,
  void,
  SetHealthMonitoringFlagQueryParams,
  SetHealthMonitoringFlagPathParams
>

interface MonitoredServiceViewsProps {
  monitoredServiceListData?: PageMonitoredServiceListItemDTO
  selectedFilter?: FilterCardItem
  setSelectedFilter: React.Dispatch<React.SetStateAction<FilterCardItem | undefined>>
  onEditService: (identifier: string) => void
  onDeleteService: (identifier: string) => Promise<void>
  onToggleService: (identifier: string, checked: boolean) => Promise<void>
  healthMonitoringFlagLoading?: boolean
}

export interface MonitoredServiceListViewProps extends MonitoredServiceViewsProps {
  setPage: React.Dispatch<React.SetStateAction<number>>
}

export interface MonitoredServiceGraphViewProps extends MonitoredServiceViewsProps {
  monitoredServiceDependencyData: DependencyData | null
}

export interface GraphSummaryCardProps {
  monitoredService: MonitoredServiceListItemDTO
  onEditService: (identifier: string) => void
  onDeleteService: (identifier: string) => Promise<void>
  onToggleService: MonitoredServiceViewsProps['onToggleService']
  healthMonitoringFlagLoading?: boolean
}

export interface RiskTagWithLabelProps {
  riskData?: RiskData
  labelVariation?: FontVariation
  color?: Color
  label?: string
}
