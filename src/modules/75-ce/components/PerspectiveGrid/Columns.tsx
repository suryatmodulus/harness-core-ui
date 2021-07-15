import React, { ReactNode } from 'react'
import type { CellProps } from 'react-table'
import formatCost from '@ce/utils/formatCost'
import {
  QlceViewFieldInputInput,
  QlceViewAggregateOperation,
  QlceViewEntityStatsDataPoint,
  ClusterData
} from 'services/ce/services'
import { CE_COLOR_CONST } from '../CEChart/CEChartOptions'
import css from './PerspectiveGrid.module.scss'

export type GridData = Omit<QlceViewEntityStatsDataPoint, 'clusterData' | '__typename'> &
  Omit<ClusterData, '__typename'> & { legendColor: string }

export const addLegendColorToRow = (data: QlceViewEntityStatsDataPoint[]): GridData[] => {
  let idx = 0
  const colors = new Map()

  return data.map(({ name, clusterData = {}, ...rest }) => {
    const key = name?.toLowerCase()
    if (!colors.has(key)) {
      colors.set(key, CE_COLOR_CONST[idx % CE_COLOR_CONST.length])
      idx++
    }

    return {
      name,
      legendColor: colors.get(key),
      ...(clusterData as ClusterData),
      ...rest
    }
  })
}

const SUM = QlceViewAggregateOperation.Sum
const AGGREGATE_FUNCTION_TYPE1 = [
  { operationType: SUM, columnName: 'cost' },
  { operationType: SUM, columnName: 'cpuBillingAmount' },
  { operationType: SUM, columnName: 'memoryBillingAmount' },
  { operationType: SUM, columnName: 'storageCost' },
  { operationType: SUM, columnName: 'unallocatedcost' },
  { operationType: SUM, columnName: 'storageUnallocatedCost' },
  { operationType: SUM, columnName: 'memoryUnallocatedCost' },
  { operationType: SUM, columnName: 'cpuUnallocatedCost' },
  { operationType: SUM, columnName: 'actualidlecost' },
  { operationType: SUM, columnName: 'cpuIdleCost' },
  { operationType: SUM, columnName: 'memoryIdleCost' },
  { operationType: SUM, columnName: 'storageActualIdleCost' }
]

const AGGREGATE_FUNCTION_TYPE2 = [
  { operationType: SUM, columnName: 'cost' },
  { operationType: SUM, columnName: 'actualidlecost' }
]

const AGGREGATE_FUNCTION_DEFAULT = [{ operationType: SUM, columnName: 'cost' }]

export const AGGREGATE_FUNCTION = {
  NAMESPACE: AGGREGATE_FUNCTION_TYPE1,
  NAMESPACE_ID: AGGREGATE_FUNCTION_TYPE1,
  CLUSTER: AGGREGATE_FUNCTION_TYPE1,
  WORKLOAD: AGGREGATE_FUNCTION_TYPE1,
  WORKLOAD_ID: AGGREGATE_FUNCTION_TYPE1,
  APPLICATION: AGGREGATE_FUNCTION_TYPE2,
  SERVICE: AGGREGATE_FUNCTION_TYPE2,
  ENVIRONMENT: AGGREGATE_FUNCTION_TYPE2,
  CLOUD_PROVIDER: AGGREGATE_FUNCTION_TYPE2,
  ECS_SERVICE: AGGREGATE_FUNCTION_TYPE2,
  ECS_SERVICE_ID: AGGREGATE_FUNCTION_TYPE2,
  ECS_LAUNCH_TYPE: AGGREGATE_FUNCTION_TYPE2,
  ECS_LAUNCH_TYPE_ID: AGGREGATE_FUNCTION_TYPE2,
  ECS_TASK: AGGREGATE_FUNCTION_TYPE2,
  ECS_TASK_ID: AGGREGATE_FUNCTION_TYPE2,
  LABELS: AGGREGATE_FUNCTION_TYPE2,
  DEFAULT: AGGREGATE_FUNCTION_DEFAULT
}

// Cell Renderers
const RenderNameCell = ({ row }: CellProps<GridData>): ReactNode => {
  const { legendColor, name } = row.original
  return (
    <span className={css.nameCell}>
      <span className={css.legendColorCtn}>
        <span style={{ background: legendColor }} className={css.legendColor}></span>
      </span>
      <span className={css.name}>{name}</span>
    </span>
  )
}

export const RenderCostCell = (props: CellProps<GridData>): JSX.Element => <span>{formatCost(+props.value)}</span>

export const RenderPercentageCell = (props: CellProps<GridData>): JSX.Element => <span>{props.value}%</span>

export type Column = {
  Header: string
  accessor: string
  className?: string
  width?: number
  sticky?: 'left' | 'right'
  Cell?: (props: CellProps<GridData>) => ReactNode
}

const COLUMNS: Record<string, Column> = {
  NAME: {
    Header: 'Name',
    accessor: 'name',
    className: 'name',
    width: 250,
    sticky: 'left',
    Cell: RenderNameCell
  },
  CLUSTER_NAME: {
    Header: 'Cluster',
    accessor: 'clusterName',
    width: 200
  },
  IDLE_COST: {
    Header: 'Idle cost',
    accessor: 'idleCost',
    width: 200,
    className: 'idle-cost cost-column',
    Cell: RenderCostCell
  },
  TOTAL_COST: {
    Header: 'Total cost',
    accessor: 'totalCost',
    width: 200,
    Cell: RenderCostCell
    // className: TOTAL_COST_CLASSNAME
  },
  COST: {
    Header: 'Total cost',
    accessor: 'cost',
    width: 200,
    sticky: 'left',
    Cell: RenderCostCell
    // className: TOTAL_COST_CLASSNAME
  },
  COST_TREND: {
    Header: 'Cost trend',
    accessor: 'costTrend',
    width: 200,
    className: 'cost-trend cost-column',
    Cell: RenderPercentageCell
  },
  UNALLOCATED_COST: {
    Header: 'Unallocated',
    accessor: 'unallocatedCost',
    width: 200,
    className: 'unallocated-cost cost-column',
    Cell: RenderCostCell
  },
  STORAGE_COST: {
    Header: 'Storage total cost',
    accessor: 'storageCost',
    width: 200,
    className: 'storage-total-cost cost-column',
    Cell: RenderCostCell
  },
  STORAGE_ACTUAL_IDLE_COST: {
    Header: 'Storage idle cost',
    accessor: 'storageActualIdleCost',
    width: 200,
    className: 'storage-idle-cost cost-column',
    Cell: RenderCostCell
  },
  STORAGE_UNALLOCATED_COST: {
    Header: 'Storage unallocated cost',
    accessor: 'storageUnallocatedCost',
    width: 225,
    className: 'storage-unallocated-cost  cost-column',
    Cell: RenderCostCell
  },
  MEMORY_BILLING_AMOUNT: {
    Header: 'Memory total cost',
    accessor: 'memoryBillingAmount',
    width: 200,
    className: 'memory-total-cost cost-column',
    Cell: RenderCostCell
  },
  MEMORY_IDLE_COST: {
    Header: 'Memory idle cost',
    accessor: 'memoryIdleCost',
    width: 200,
    className: 'workload-memory-idle-cost cost-column',
    Cell: RenderCostCell
  },
  MEMORY_UNALLOCATED_COST: {
    Header: 'Memory unallocated cost',
    accessor: 'memoryUnallocatedCost',
    width: 200,
    className: 'memory-unallocated-cost cost-column',
    Cell: RenderCostCell
  },
  CPU_BILLING_AMOUNT: {
    Header: 'CPU total cost',
    accessor: 'cpuBillingAmount',
    width: 200,
    className: 'cpu-total-cost cost-column',
    Cell: RenderCostCell
  },
  CPU_IDLE_COST: {
    Header: 'CPU idle cost',
    accessor: 'cpuIdleCost',
    width: 200,
    className: 'workload-cpu-idle-cost cost-column',
    Cell: RenderCostCell
  },
  CPU_UNALLOCATED_COST: {
    Header: 'CPU unallocated cost',
    accessor: 'cpuUnallocatedCost',
    width: 200,
    className: 'cpu-unallocated-cost cost-column',
    Cell: RenderCostCell
  },
  NAMESPACE: {
    Header: 'Namespace',
    accessor: 'namespace',
    width: 200,
    className: 'workload-namespace'
  },
  WORKLOAD: {
    Header: 'Workload',
    accessor: 'workloadName',
    width: 200,
    className: 'workload-name'
  },
  WORKLOAD_TYPE: {
    Header: 'Workload Type',
    accessor: 'workloadType',
    width: 200,
    className: 'workloadType'
  },
  APPLICATION_NAME: {
    Header: 'Application',
    accessor: 'appName',
    width: 200,
    className: 'name'
  },
  SERVICE: {
    Header: 'Service',
    accessor: 'serviceName',
    width: 200,
    className: 'service'
  },
  ENVIRONMENT: {
    Header: 'Environment',
    accessor: 'envName',
    width: 200,
    className: 'environment'
  },
  CLOUD_PROVIDER: {
    Header: 'Cloud provider',
    accessor: 'cloudProvider',
    width: 200,
    className: 'clour-provider'
  },
  ECS_SERVICE: {
    Header: 'ECS Service',
    accessor: 'cloudServiceName',
    width: 200,
    className: 'ecs-service'
  },
  ECS_LAUNCH_TYPE: {
    Header: 'ECS Launch Type',
    accessor: 'launchType',
    width: 200
  },
  ECS_LAUNCH_TYPE_ID: {
    Header: 'ECS Launch Type ID',
    accessor: 'launchType',
    width: 200
  },
  ECS_TASK: {
    Header: 'ECS Task',
    accessor: 'taskId',
    width: 200
  },
  ECS_TASK_ID: {
    Header: 'ECS Task ID',
    accessor: 'taskId',
    width: 200
  },
  REGION: {
    Header: 'Region',
    accessor: 'region',
    width: 200,
    className: 'region'
  },
  WORKLOAD_IDLE_COST: {
    Header: 'Idle cost',
    accessor: 'idleCost',
    width: 200,
    className: 'workload-idle-cost cost-column',
    Cell: RenderCostCell
  },
  CPU_UTILIZATION: {
    Header: 'CPU utilization',
    accessor: 'avgCpuUtilization',
    width: 200,
    className: 'workload-cpu-utilization',
    Cell: RenderPercentageCell
  },
  MEMORY_UTILIZATION: {
    Header: 'Memory utilization',
    accessor: 'avgMemoryUtilization',
    width: 200,
    className: 'workload-avg-memory-utilization',
    Cell: RenderPercentageCell
  },
  CREATION_TIME: {
    Header: 'Creation Time',
    accessor: 'createTime',
    width: 200
    // type: DATE_TIME_COLUMN,
    // className: COST_COLUMN_CLASSNAME
    // renderer: dateRenderer
  },
  DELETION_TIME: {
    Header: 'Deletion Time',
    accessor: 'deleteTime',
    width: 200
    // type: DATE_TIME_COLUMN,
    // className: COST_COLUMN_CLASSNAME
    // renderer: dateRenderer
  },
  CPU_REQUESTED: {
    Header: 'CPU Requested (vCPU)',
    accessor: 'cpuRequested',
    width: 200
    // className: COST_COLUMN_CLASSNAME
    // renderer: cpuCostRenderer
  },
  MEMORY_REQUESTED: {
    Header: 'Memory Requested (GB)',
    accessor: 'memoryRequested',
    width: 200
    // className: COST_COLUMN_CLASSNAME
    // renderer: memoryRenderer
  },
  AWS_REGION: {
    Header: 'AWS Region',
    accessor: 'region',
    width: 200,
    className: 'name'
  },
  AWS_UNBLEDNDED_COST: {
    Header: 'Total Cost',
    accessor: 'awsUnblendedCost',
    width: 200
    // className: TOTAL_COST_CLASSNAME
    // renderer: costRenderer
  },
  AWS_BLEDNDED_COST: {
    Header: 'Blended Cost',
    accessor: 'awsBlendedCost',
    width: 200
    // className: TOTAL_COST_CLASSNAME
    // renderer: costRenderer
  },
  AWS_ACCOUNT: {
    Header: 'Account',
    accessor: 'awsLinkedAccount',
    width: 200,
    className: 'name'
  },
  AWS_SERVICE: {
    Header: 'Service',
    accessor: 'awsService',
    width: 200,
    className: 'name'
  },
  AWS_INSTANCE_TYPE: {
    Header: 'Instance Type',
    accessor: 'awsInstanceType',
    width: 200,
    className: 'name'
  },
  AWS_USAGE_TYPE: {
    Header: 'Usage Type',
    accessor: 'awsUsageType',
    width: 200,
    className: 'name'
  },
  GCP_TOTAL_COST: {
    Header: 'Total Cost',
    accessor: 'gcpTotalCost',
    width: 200
    // className: TOTAL_COST_CLASSNAME
    // renderer: costRenderer
  },
  GCP_SUB_TOTAL: {
    Header: 'Sub Total',
    accessor: 'gcpSubTotalCost',
    width: 200,
    className: 'gcp-sub-total cost-column'
    // renderer: costRenderer
  },
  GCP_DISCOUNT: {
    Header: 'Discount',
    accessor: 'gcpDiscount',
    width: 200,
    className: 'gcp-discount cost-column'
    // renderer: discountRenderer
  },
  GCP_PROJECT_ID: {
    Header: 'Project ID',
    accessor: 'gcpProjectId',
    width: 200,
    className: 'name'
  },
  GCP_PRODUCT: {
    Header: 'Product',
    accessor: 'gcpProduct',
    width: 200,
    className: 'name'
  },
  GCP_SKU: {
    Header: 'SKU ID',
    accessor: 'gcpSkuId',
    width: 200,
    className: 'name'
  },
  GCP_SKU_DESC: {
    Header: 'SKU Name',
    accessor: 'gcpSkuDescription',
    width: 200,
    className: 'name'
  },
  GCP_LABEL_ID: {
    Header: 'Label',
    accessor: 'gcpLabel',
    width: 200,
    className: 'gcpLabel'
  },
  EFFICIENCY_SCORE: {
    Header: 'Efficiency Score',
    accessor: 'efficiencyScore',
    width: 200,
    className: 'cost-column efficiency-score'
    // renderer: efficiencyScoreRenderer
  },
  INSTANCE_NAME: {
    Header: 'Instance name',
    accessor: 'instanceName',
    width: 200,
    className: 'instance-name'
  },
  CLAIM_NAME: {
    Header: 'Claim name',
    accessor: 'claimName',
    width: 200,
    className: 'name'
  },
  STORAGE_CLASS: {
    Header: 'Storage class',
    accessor: 'storageClass',
    width: 200,
    className: 'name'
  },
  CAPACITY: {
    Header: 'Capacity (GB)',
    accessor: 'capacity',
    width: 200
  },
  STORAGE_UTILIZATION_VALUE: {
    Header: 'Storage Utilization (GB)',
    accessor: 'storageUtilizationValue',
    width: 200
  },
  VOLUME_TYPE: {
    Header: 'Volume type',
    accessor: 'volumeType',
    width: 200,
    className: 'name'
  },
  STORAGE_REQUEST: {
    accessor: 'storageRequest',
    width: 200,
    Header: 'Storage request'
  }
}

export const CLUSTER_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.IDLE_COST,
  COLUMNS.UNALLOCATED_COST,
  COLUMNS.STORAGE_COST,
  COLUMNS.STORAGE_ACTUAL_IDLE_COST,
  COLUMNS.STORAGE_UNALLOCATED_COST,
  COLUMNS.MEMORY_BILLING_AMOUNT,
  COLUMNS.MEMORY_IDLE_COST,
  COLUMNS.MEMORY_UNALLOCATED_COST,
  COLUMNS.CPU_BILLING_AMOUNT,
  COLUMNS.CPU_IDLE_COST,
  COLUMNS.CPU_UNALLOCATED_COST
]

export const NAMESPACE_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.NAMESPACE,
  COLUMNS.IDLE_COST,
  COLUMNS.UNALLOCATED_COST,
  COLUMNS.STORAGE_COST,
  COLUMNS.STORAGE_ACTUAL_IDLE_COST,
  COLUMNS.STORAGE_UNALLOCATED_COST,
  COLUMNS.MEMORY_BILLING_AMOUNT,
  COLUMNS.MEMORY_IDLE_COST,
  COLUMNS.MEMORY_UNALLOCATED_COST,
  COLUMNS.CPU_BILLING_AMOUNT,
  COLUMNS.CPU_IDLE_COST,
  COLUMNS.CPU_UNALLOCATED_COST
]

export const NAMESPACE_ID_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.NAMESPACE,
  COLUMNS.CLUSTER_NAME,
  COLUMNS.IDLE_COST,
  COLUMNS.UNALLOCATED_COST,
  COLUMNS.STORAGE_COST,
  COLUMNS.STORAGE_ACTUAL_IDLE_COST,
  COLUMNS.STORAGE_UNALLOCATED_COST,
  COLUMNS.MEMORY_BILLING_AMOUNT,
  COLUMNS.MEMORY_IDLE_COST,
  COLUMNS.MEMORY_UNALLOCATED_COST,
  COLUMNS.CPU_BILLING_AMOUNT,
  COLUMNS.CPU_IDLE_COST,
  COLUMNS.CPU_UNALLOCATED_COST
]

export const WORKLOAD_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.WORKLOAD,
  COLUMNS.IDLE_COST,
  COLUMNS.UNALLOCATED_COST,
  COLUMNS.STORAGE_COST,
  COLUMNS.STORAGE_ACTUAL_IDLE_COST,
  COLUMNS.STORAGE_UNALLOCATED_COST,
  COLUMNS.MEMORY_BILLING_AMOUNT,
  COLUMNS.MEMORY_IDLE_COST,
  COLUMNS.MEMORY_UNALLOCATED_COST,
  COLUMNS.CPU_BILLING_AMOUNT,
  COLUMNS.CPU_IDLE_COST,
  COLUMNS.CPU_UNALLOCATED_COST
]

export const WORKLOAD_ID_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.WORKLOAD,
  COLUMNS.WORKLOAD_TYPE,
  COLUMNS.NAMESPACE,
  COLUMNS.CLUSTER_NAME,
  COLUMNS.IDLE_COST,
  COLUMNS.UNALLOCATED_COST,
  COLUMNS.STORAGE_COST,
  COLUMNS.STORAGE_ACTUAL_IDLE_COST,
  COLUMNS.STORAGE_UNALLOCATED_COST,
  COLUMNS.MEMORY_BILLING_AMOUNT,
  COLUMNS.MEMORY_IDLE_COST,
  COLUMNS.MEMORY_UNALLOCATED_COST,
  COLUMNS.CPU_BILLING_AMOUNT,
  COLUMNS.CPU_IDLE_COST,
  COLUMNS.CPU_UNALLOCATED_COST
]

export const APPLICATION_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.APPLICATION_NAME,
  COLUMNS.IDLE_COST
]

export const SERVICE_COLS = [COLUMNS.NAME, COLUMNS.COST, COLUMNS.COST_TREND, COLUMNS.SERVICE, COLUMNS.IDLE_COST]

export const ENVIRONMENT_COLS = [COLUMNS.NAME, COLUMNS.COST, COLUMNS.COST_TREND, COLUMNS.ENVIRONMENT, COLUMNS.IDLE_COST]

export const CLOUD_PROVIDER_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.CLOUD_PROVIDER,
  COLUMNS.IDLE_COST
]

export const ECS_SERVICE_COLS = [COLUMNS.NAME, COLUMNS.COST, COLUMNS.COST_TREND, COLUMNS.ECS_SERVICE, COLUMNS.IDLE_COST]

export const ECS_SERVICE_ID_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.ECS_SERVICE,
  COLUMNS.IDLE_COST,
  COLUMNS.CLUSTER_NAME,
  COLUMNS.ECS_LAUNCH_TYPE
]

export const ECS_LAUNCH_TYPE_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.IDLE_COST,
  COLUMNS.ECS_LAUNCH_TYPE
]

export const ECS_LAUNCH_TYPE_ID_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.IDLE_COST,
  COLUMNS.CLUSTER_NAME,
  COLUMNS.ECS_LAUNCH_TYPE_ID
]

export const ECS_TASK_COLS = [COLUMNS.NAME, COLUMNS.COST, COLUMNS.COST_TREND, COLUMNS.ECS_TASK, COLUMNS.IDLE_COST]

export const ECS_TASK_ID_COLS = [
  COLUMNS.NAME,
  COLUMNS.COST,
  COLUMNS.COST_TREND,
  COLUMNS.ECS_TASK_ID,
  COLUMNS.IDLE_COST,
  COLUMNS.ECS_SERVICE,
  COLUMNS.CLUSTER_NAME,
  COLUMNS.ECS_LAUNCH_TYPE_ID
]

export const LABELS_COLS = [COLUMNS.NAME, COLUMNS.COST, COLUMNS.COST_TREND, COLUMNS.IDLE_COST]

// TODO: remove after demo
export const PERSPECTIVE_PREVIEW_COLS = [
  {
    Header: 'Name',
    accessor: 'name',
    className: 'name',
    width: 250,
    Cell: RenderNameCell
  },
  {
    Header: 'Total cost',
    accessor: 'cost',
    width: 200,
    Cell: RenderCostCell
  },
  {
    Header: 'Cost trend',
    accessor: 'costTrend',
    width: 200,
    className: 'cost-trend cost-column',
    Cell: RenderPercentageCell
  }
]

export const GroupByMapping: Record<string, Column[]> = {
  'Cluster Name': CLUSTER_COLS,
  Namespace: NAMESPACE_COLS,
  'Namespace Id': NAMESPACE_ID_COLS,
  Workload: WORKLOAD_COLS,
  'Workload Id': WORKLOAD_ID_COLS,
  Application: APPLICATION_COLS,
  Service: SERVICE_COLS,
  Environment: ENVIRONMENT_COLS,
  'Cloud Provider': CLOUD_PROVIDER_COLS,
  'ECS Service': ECS_SERVICE_COLS,
  'ECS Service Id': ECS_SERVICE_ID_COLS,
  'ECS Launch Type': ECS_LAUNCH_TYPE_COLS,
  'ECS Launch Type Id': ECS_LAUNCH_TYPE_ID_COLS,
  'ECS Task': ECS_TASK_COLS,
  'ECS Task Id': ECS_TASK_ID_COLS
}

export const getGridColumnsByGroupBy = (groupBy: QlceViewFieldInputInput): Column[] => {
  const { fieldName, identifier } = groupBy

  if (identifier === 'LABEL') {
    return LABELS_COLS
  }

  return GroupByMapping[fieldName] || PERSPECTIVE_PREVIEW_COLS
}
