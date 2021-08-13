import type { AppDynamicsHealthSourceSpec } from 'services/cv'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'

export const createAppDynamicsData = (sourceData: any) => {
  const payload: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  )

  const { applicationName, tierName, metricPacks } = (payload?.spec as AppDynamicsHealthSourceSpec) || {}
  return {
    name: sourceData?.healthSourceName,
    identifier: sourceData?.healthSourceIdentifier,
    connectorRef: sourceData?.connectorRef,
    isEdit: sourceData?.isEdit,
    product: sourceData?.product,
    type: HealthSourceTypes.AppDynamics,
    applicationName,
    tierName,
    metricPacks
  }
}
