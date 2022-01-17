/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export interface VersionMap {
  [key: string]: number
}

export enum LICENSE_STATE_VALUES {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  EXPIRED = 'EXPIRED',
  NOT_STARTED = 'NOT_STARTED'
}
