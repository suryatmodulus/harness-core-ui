import React from 'react'
import { String } from 'framework/strings'
import { CCM_PAGE_TYPE } from '@ce/types'

const OVERVIEW_FIELD = {
  WORKLOAD_NAME: {
    key: 'workloadName',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.workload" />
  },
  NAMESPACE: {
    key: 'namespace',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.namespace" />
  },
  WORKLOAD_TYPE: {
    key: 'workloadType',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.workloadType" />
  },
  CLUSTER_NAME: {
    key: 'clusterName',
    name: <String stringID="ce.perspectives.workloadDetails.fieldNames.clusterName" />
  }
}

const WORKLOAD_OVERVIEW_FIELD = [
  [OVERVIEW_FIELD.WORKLOAD_NAME, OVERVIEW_FIELD.NAMESPACE, OVERVIEW_FIELD.WORKLOAD_TYPE, OVERVIEW_FIELD.CLUSTER_NAME]
]

export const OVERVIEW_FIELD_MAPPER = {
  [CCM_PAGE_TYPE.Workload]: WORKLOAD_OVERVIEW_FIELD
}
