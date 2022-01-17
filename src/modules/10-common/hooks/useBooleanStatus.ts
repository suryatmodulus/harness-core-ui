/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState } from 'react'

export interface UseBooleanStatusReturn {
  state: boolean
  toggle(): void
  open(): void
  close(): void
}

export function useBooleanStatus(init?: boolean): UseBooleanStatusReturn {
  const [state, setState] = useState(!!init)

  return {
    state,
    toggle() {
      setState(s => !s)
    },
    open() {
      setState(true)
    },
    close() {
      setState(false)
    }
  }
}
