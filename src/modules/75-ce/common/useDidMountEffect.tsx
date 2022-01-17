/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useRef, useEffect } from 'react'

const useDidMountEffect = (func: () => void, deps: any[]) => {
  const didMount = useRef(false)

  useEffect(() => {
    if (didMount.current) func()
    else didMount.current = true
  }, deps)
}

export default useDidMountEffect
