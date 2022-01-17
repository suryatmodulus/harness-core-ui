/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { Dispatch, SetStateAction } from 'react'

export interface GroupNameProps {
  groupNames?: SelectOption[]
  onChange: (name: string, value: SelectOption) => void
  item?: SelectOption
  setGroupNames: Dispatch<SetStateAction<SelectOption[]>>
}

export type CreateGroupName = {
  name: string
}
