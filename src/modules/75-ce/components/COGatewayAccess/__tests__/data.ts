/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const mockedSecurityGroupResponse = {
  'i-09933bfb425912567': [
    {
      id: 'sg-0fdba2cc7d3b26e14',
      name: 'default',
      // eslint-disable-next-line
      inbound_rules: [
        {
          from: '0',
          protocol: '-1',
          to: '0'
        }
      ],
      // eslint-disable-next-line
      outbound_rules: [
        {
          from: '0',
          protocol: '-1',
          to: '0'
        }
      ]
    }
  ]
}
