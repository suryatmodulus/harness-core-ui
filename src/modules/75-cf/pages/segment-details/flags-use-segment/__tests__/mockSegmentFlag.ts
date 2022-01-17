/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SegmentFlag } from 'services/cf'

const mockSegmentFlag: SegmentFlag[] = [
  {
    description: '',
    environment: 'testnonprod',
    identifier: 'asdasdasd',
    name: 'flag_with_prereqs',
    project: 'chrisgit2',
    type: 'DIRECT',
    variation: 'true'
  }
]

export default mockSegmentFlag
