/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ChangeSourceDTO } from 'services/cv'
import type { ChangeSoureDrawerInterface } from '../ChangeSourceDrawer/ChangeSourceDrawer.types'

export interface ChangeSourceTableInterface {
  value: Array<ChangeSourceDTO>
  onEdit: (val: ChangeSoureDrawerInterface) => void
  onSuccess: (value: ChangeSourceDTO[]) => void
}
