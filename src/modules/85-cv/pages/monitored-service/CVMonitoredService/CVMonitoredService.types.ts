import type { Color, FontVariation } from '@wings-software/uicore'
import type { CountServiceDTO, PageMonitoredServiceListItemDTO, RiskData } from 'services/cv'
import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

interface ContextMenuRbacPermissions {
  edit: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  delete: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
}

export interface ContextMenuActionsProps {
  onEdit?(): void
  onDelete?(): void
  titleText: string
  contentText: string | JSX.Element
  confirmButtonText?: string
  deleteLabel?: string
  editLabel?: string
  RbacPermissions?: ContextMenuRbacPermissions
}

export enum FilterTypes {
  ALL = 'ALL',
  RISK = 'RISK',
  DEPLOYMENT = 'DEPLOYMENT',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  INSIGHT = 'INSIGHT'
}

// MonitoredServiceListView

export interface MonitoredServiceListProps {
  page: number
  setPage: (n: number) => void
  createButton: JSX.Element
  environmentIdentifier?: string
  selectedFilter: FilterTypes
  onFilter: (type: FilterTypes) => void
  serviceCountData: CountServiceDTO | null
  serviceCountLoading?: boolean
  serviceCountErrorMessage?: string
  refetchServiceCountData: () => Promise<void>
}

export interface MonitoredServiceListViewProps {
  setPage: (n: number) => void
  selectedFilter: FilterTypes
  onFilter: (type: FilterTypes) => void
  onEditService: (identifier: string) => void
  onToggleService: (identifier: string, checked: boolean) => Promise<void>
  onDeleteService: (identifier: string) => Promise<void>
  serviceCountData: CountServiceDTO | null
  refetchServiceCountData: () => Promise<void>
  healthMonitoringFlagLoading?: boolean
  monitoredServiceListData?: PageMonitoredServiceListItemDTO
}

export interface RiskTagWithLabelProps {
  riskData?: RiskData
  labelVariation?: FontVariation
  color?: Color
  label?: string
  isDarkBackground?: boolean
}
