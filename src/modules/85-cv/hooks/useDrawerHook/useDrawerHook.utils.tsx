import { Position, IDrawerProps } from '@blueprintjs/core'
import { merge } from 'lodash-es'
import { DRAWER_OFFSET_LEFT } from './useDrawerHook.constant'

export const getDefaultDrawerProps = ({
  showWarning,
  createHeader
}: {
  showWarning: () => void
  createHeader: undefined | (() => JSX.Element)
}): IDrawerProps => {
  const title = createHeader ? { title: createHeader() } : {}
  return {
    onClose: showWarning,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: false,
    hasBackdrop: true,
    size: `calc(100% - ${DRAWER_OFFSET_LEFT})`,
    isOpen: true,
    position: Position.RIGHT,
    ...title,
    isCloseButtonShown: false,
    portalClassName: 'health-source-right-drawer'
  }
}

export const getParsedDrawerOptions = (defaultOptions: IDrawerProps, options: IDrawerProps | undefined) => {
  if (options) {
    return merge(defaultOptions, options)
  } else {
    return defaultOptions
  }
}
