/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { PROVIDER_TYPES } from '@ce/constants'
import type { Resource } from 'services/lw'

export const resourceToInstanceObject = (providerType: string, item: Resource) => {
  return {
    name: item.name ? item.name : '',
    id: item.id ? item.id : '',
    ipv4: item.ipv4 ? item.ipv4[0] : '',
    region: item.region ? item.region : '',
    type: item.type ? item.type : '',
    tags: '',
    launch_time: item.launch_time ? item.launch_time : '', // eslint-disable-line
    status: item.status ? item.status : '',
    vpc: item.metadata ? item.metadata['VpcID'] : '',
    ...(providerType === PROVIDER_TYPES.AZURE && { metadata: { resourceGroup: item.metadata?.resourceGroup } })
  }
}
