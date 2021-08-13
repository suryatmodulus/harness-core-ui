import type { NewRelicHealthSourceSpec } from 'services/cv'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'

export const createNewRelicData = (sourceData: any) => {
  const payload: UpdatedHealthSource = sourceData?.healthSourceList.find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  )

  const { applicationName, applicationId, metricPacks } = (payload?.spec as NewRelicHealthSourceSpec) || {}
  return {
    name: sourceData?.healthSourceName,
    identifier: sourceData?.healthSourceIdentifier,
    connectorRef: sourceData?.connectorRef,
    isEdit: sourceData?.isEdit,
    product: sourceData?.product,
    type: HealthSourceTypes.NewRelic,
    applicationName,
    applicationId,
    metricPacks
  }
}
