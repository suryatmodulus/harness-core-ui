import type { MonitoredServiceRef } from '@cv/pages/monitored-service/component/MonitoredService.types'
import type {
  HealthSource,
  AppDynamicsHealthSourceSpec,
  MonitoredServiceResponse,
  PrometheusHealthSourceSpec,
  NewRelicHealthSourceSpec
} from 'services/cv'
import type { GCOLogsHealthSourceSpec } from '../connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/types'

export interface UpdatedHealthSource extends Omit<HealthSource, 'spec'> {
  spec: AppDynamicsHealthSourceSpec | GCOLogsHealthSourceSpec | PrometheusHealthSourceSpec | NewRelicHealthSourceSpec
}

export interface RowData extends HealthSource {
  serviceRef?: string
  environmentRef?: string
}

export interface SourceDataInterface {
  isEdit: boolean
  serviceRef: string
  environmentRef: string
  monitoredServiceRef: MonitoredServiceRef
  rowData?: RowData | null
  tableData?: Array<RowData>
  modalOpen?: boolean
  createHeader?: () => JSX.Element
  onClose?: (val: any) => void
  sourceType?: string
  connectorRef?: string
  healthSourceName?: string
  healthSourceIdentifier?: string
  healthSourceList?: Array<RowData>
}

export interface HealthSourceDrawerInterface {
  rowData?: RowData | null
  tableData: Array<RowData>
  serviceRef: string
  environmentRef: string
  monitoredServiceRef: MonitoredServiceRef
  onSuccess: (data: MonitoredServiceResponse) => void
  modalOpen: boolean
  createHeader: () => JSX.Element
  onClose: (val: any) => void
  isEdit: boolean
  shouldRenderAtVerifyStep?: boolean
}
