import type { SelectOption } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import type { AppDynamicsHealthSourceSpec } from 'services/cv'
import type { updatedHealthSource } from './HealthSourceDrawerContent'

const getValueBySourceType = (type: string, rowData: updatedHealthSource) => {
  switch (type) {
    case Connectors.APP_DYNAMICS:
      return getAppDFields(rowData)
    default:
      break
  }
}

export const getAppDFields = (rowData: updatedHealthSource) => {
  return {
    product: (rowData?.spec as AppDynamicsHealthSourceSpec)?.feature,
    appdApplicationName: (rowData?.spec as AppDynamicsHealthSourceSpec)?.appdApplicationName,
    appdTierName: (rowData?.spec as AppDynamicsHealthSourceSpec).appdTierName,
    metricPacks: (rowData?.spec as AppDynamicsHealthSourceSpec).metricPacks
  }
}

interface SourceDataInterface {
  isEdit: boolean
  rowData?: updatedHealthSource | null
  tableData?: Array<updatedHealthSource>
  modalOpen?: boolean
  createHeader?: () => JSX.Element
  onClose?: (val: any) => void
  serviceName: string
  serviceIdentifier: string
  environmentIdentifier: string
  environmentName: string
  sourceType?: string
  connectorRef?: string
  healthSourceName?: string
  healthSourceidentifier?: string
  monitoringSourceName: string
  monitoredServiceIdentifier: string
  healthSourceList?: Array<updatedHealthSource>
}

export const createHealthSourceDrawerFormData = (
  rowData: updatedHealthSource | null,
  isEdit: boolean,
  monitoringSourcRef: { monitoredServiceIdentifier: string; monitoredServiceName: string },
  serviceRef: SelectOption | undefined,
  environmentRef: SelectOption | undefined,
  tableData: Array<updatedHealthSource>
): SourceDataInterface => {
  let sourceData: SourceDataInterface = {
    isEdit,
    healthSourceList: tableData,
    environmentName: environmentRef?.label as string,
    environmentIdentifier: environmentRef?.value as string,
    serviceName: serviceRef?.label as string,
    serviceIdentifier: serviceRef?.value as string,
    monitoringSourceName: monitoringSourcRef?.monitoredServiceName,
    monitoredServiceIdentifier: monitoringSourcRef?.monitoredServiceIdentifier
  }

  if (isEdit) {
    if (!rowData) return sourceData
    const sourceTypeValue = getValueBySourceType(rowData?.type || '', rowData)
    sourceData = {
      ...sourceData,
      ...sourceTypeValue,
      healthSourceName: rowData?.name,
      healthSourceidentifier: rowData?.identifier,
      sourceType: rowData?.type,
      connectorRef: rowData?.spec?.connectorRef
    }
  }

  return sourceData
}
