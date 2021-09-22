import React from 'react'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'

function getVisiblePropEvent(): { hidden?: string; visibilityChange?: string } {
  // Set the name of the hidden property and the change event for visibility
  let hidden: string | undefined = undefined
  let visibilityChange: string | undefined = undefined
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden'
    visibilityChange = 'visibilitychange'
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden'
    visibilityChange = 'msvisibilitychange'
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden'
    visibilityChange = 'webkitvisibilitychange'
  }
  return { hidden, visibilityChange }
}
const logger = loggerFor(ModuleName.COMMON)

// Adopted from https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API

export default function useTabVisible(): boolean {
  const [visible, setVisibility] = React.useState<boolean>(true)
  React.useEffect(() => {
    const { hidden, visibilityChange } = getVisiblePropEvent()
    function handleVisibilityChange(): void {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (hidden && (document as any)[hidden]) {
        setVisibility(false)
      } else {
        setVisibility(true)
      }
    }
    if (
      typeof document.addEventListener === 'undefined' ||
      typeof hidden === 'undefined' ||
      typeof visibilityChange === 'undefined'
    ) {
      logger.info('The Page Visibility API is not supported')
    } else {
      // Handle page visibility change
      document.addEventListener(visibilityChange, handleVisibilityChange, false)
      return () => {
        document.removeEventListener(visibilityChange, handleVisibilityChange, false)
      }
    }
  }, [])
  return visible
}
