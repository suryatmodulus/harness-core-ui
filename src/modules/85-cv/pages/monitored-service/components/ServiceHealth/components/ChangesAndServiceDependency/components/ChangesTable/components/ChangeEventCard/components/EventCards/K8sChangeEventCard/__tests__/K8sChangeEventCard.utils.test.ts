/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createK8ChangeInfoData } from '../K8sChangeEventCard.utils'
import { mockK8sChangeResponse } from './K8sChangeEventCard.mock'

describe('Validate Utils', () => {
  test('should createK8ChangeInfoData', () => {
    expect(createK8ChangeInfoData(mockK8sChangeResponse.metadata)).toEqual({
      summary: {
        kind: null,
        namespace: 'ingress-nginx',
        reason: null,
        workload: 'ingress-controller-leader-nginx'
      },
      triggerAt: '14th Oct 09:52 PM'
    })
  })
})
