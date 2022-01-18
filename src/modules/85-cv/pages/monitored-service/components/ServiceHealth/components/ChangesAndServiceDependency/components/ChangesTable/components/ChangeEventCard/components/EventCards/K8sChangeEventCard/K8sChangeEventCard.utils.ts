/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import type { ChangeEventMetadata } from 'services/cv'

export const createK8ChangeInfoData = (metadata: ChangeEventMetadata | undefined) => {
  const { timestamp = 0, workload, namespace, kind, reason } = metadata || {}
  return {
    triggerAt: moment(new Date(timestamp * 1000)).format('Do MMM hh:mm A'),
    summary: {
      workload,
      namespace,
      kind,
      reason
    }
  }
}
