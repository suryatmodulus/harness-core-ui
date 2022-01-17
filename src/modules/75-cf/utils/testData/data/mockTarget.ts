/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Target } from 'services/cf'

const mockTarget: Target = {
  account: '',
  anonymous: false,
  attributes: {},
  createdAt: 1634641767373,
  environment: 'testnonprod',
  identifier: 'another_target',
  name: 'another target',
  org: '',
  project: 'chrisgit2',
  segments: []
}

export default mockTarget
