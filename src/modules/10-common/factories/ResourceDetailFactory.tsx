/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
