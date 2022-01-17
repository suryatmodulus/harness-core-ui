/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useRef } from 'react'

export type EventHandler<K extends keyof WindowEventMap> = (ev: WindowEventMap[K]) => void

export function useGlobalEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: EventHandler<K>,
  options?: AddEventListenerOptions
): void {
  const savedHandler = useRef<EventHandler<K> | undefined>()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const eventListener = (event: WindowEventMap[K]): void => {
      if (typeof savedHandler.current === 'function') {
        savedHandler.current(event)
      }
    }

    window.addEventListener(type, eventListener, options)

    return (): void => {
      window.removeEventListener(type, eventListener, options)
    }
  })
}
