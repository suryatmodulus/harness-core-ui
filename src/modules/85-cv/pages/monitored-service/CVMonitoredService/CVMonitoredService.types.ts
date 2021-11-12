import type { Color, FontVariation } from '@wings-software/uicore'
import type {
  CountServiceDTO,
  MonitoredServiceListItemDTO,
  PageMonitoredServiceListItemDTO,
  RiskData
} from 'services/cv'
import type { DependencyData } from '@cv/components/DependencyGraph/DependencyGraph.types'

export interface ContextMenuActionsProps {
  onEdit?(): void
  onDelete?(): void
  titleText: string
  contentText: string | JSX.Element
  confirmButtonText?: string
  deleteLabel?: string
  editLabel?: string
}

export enum FilterTypes {
  ALL = 'ALL',
  RISK = 'RISK',
  DEPLOYMENT = 'DEPLOYMENT',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  INSIGHT = 'INSIGHT'
}

interface MonitoredServiceViewsProps {
  serviceCountData: CountServiceDTO | null
  monitoredServiceListData?: PageMonitoredServiceListItemDTO
  selectedFilter: FilterTypes
  onFilter: (type: FilterTypes) => void
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
  isDarkBackground?: boolean
}
