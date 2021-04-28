import type React from 'react'
import type { EntityDetail, ListReferredByEntitiesQueryParams, SetupUsageDetail } from 'services/cd-ng'

export interface ResourceDetailsProps {
  referredEntity?: EntityDetail
  referredByEntity?: EntityDetail
  detail?: SetupUsageDetail
}
interface ResourceDetailHandler {
  getResourceDetailViewAndAction: (props: ResourceDetailsProps) => React.ReactElement
}

class ResourceDetailFactory {
  private referredByEntityMap: Map<ListReferredByEntitiesQueryParams['referredEntityType'], ResourceDetailHandler>
  private referredEntityUsageDetailMap: Map<string, ResourceDetailHandler>

  constructor() {
    this.referredByEntityMap = new Map()
    this.referredEntityUsageDetailMap = new Map()
  }

  registerReferredByEntityTypeHandler(
    referredResourceType: ListReferredByEntitiesQueryParams['referredEntityType'],
    handler: ResourceDetailHandler
  ): void {
    this.referredByEntityMap.set(referredResourceType, handler)
  }

  getReferredByEntityTypeHandler(
    referredResourceType: ListReferredByEntitiesQueryParams['referredEntityType']
  ): ResourceDetailHandler | undefined {
    return this.referredByEntityMap.get(referredResourceType)
  }

  registerReferredEntityUsageDetailTypeHandler(referredEntityDetail: string, handler: ResourceDetailHandler): void {
    this.referredEntityUsageDetailMap.set(referredEntityDetail, handler)
  }

  getReferredEntityUsageDetailTypeHandler(referredEntityDetail: string): ResourceDetailHandler | undefined {
    return this.referredEntityUsageDetailMap.get(referredEntityDetail)
  }
}

export default new ResourceDetailFactory()
