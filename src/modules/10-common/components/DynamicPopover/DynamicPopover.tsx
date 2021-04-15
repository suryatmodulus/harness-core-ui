import React, { useState, useMemo } from 'react'
import { usePopper } from 'react-popper'
import cx from 'classnames'
import type * as PopperJS from '@popperjs/core'
import { useGlobalEventListener } from '@common/hooks'
import css from './DynamicPopover.module.scss'

declare global {
  interface WindowEventMap {
    UPDATE_POPOVER_POSITION: CustomEvent<string>
  }
}
export interface DynamicPopoverHandlerBinding<T> {
  show: (
    ref: Element | PopperJS.VirtualElement | string,
    data?: T,
    options?: { darkMode?: boolean; useArrows?: boolean },
    onHideCallBack?: () => void
  ) => void
  hide: () => void
}

export interface DynamicPopoverProps<T> {
  render: (data: T) => JSX.Element
  className?: string
  darkMode?: boolean
  useArrows?: boolean
  bind: (dynamicPopoverHandler: DynamicPopoverHandlerBinding<T>) => void
  closeOnMouseOut?: boolean
}

export function DynamicPopover<T>(props: DynamicPopoverProps<T>): JSX.Element {
  const { bind, render, className = '', darkMode = false, useArrows = true, closeOnMouseOut } = props
  const [darkModeState, setDarkMode] = useState<boolean>(darkMode)
  const [useArrowsState, setArrowVisibility] = useState<boolean>(useArrows)

  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null)
  const [data, setData] = useState<T>()
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null)
  const [referenceElement, setReferenceElement] = useState<Element | PopperJS.VirtualElement | null>(null)
  const [visible, setVisibility] = useState<boolean>(false)
  const [hideCallback, setHideCallBack] = useState<() => void | undefined>()
  const timerRef = React.useRef<number | null>(null)
  const mouseInRef = React.useRef<boolean>(false)

  const { styles, attributes, forceUpdate } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
    placement: 'auto'
  })

  useGlobalEventListener('UPDATE_POPOVER_POSITION', () => {
    forceUpdate?.()
  })

  const handler = useMemo(
    () =>
      ({
        show: (ref, dataTemp, options, callback) => {
          if (timerRef.current) {
            window.clearTimeout(timerRef.current)
          }
          setVisibility(true)
          setData(dataTemp)

          if (typeof ref === 'string') {
            setReferenceElement(document.querySelector(ref))
          } else {
            setReferenceElement(ref)
          }

          if (options) {
            typeof options.darkMode === 'boolean' && setDarkMode(options.darkMode)
            typeof options.useArrows === 'boolean' && setArrowVisibility(options.useArrows)
          }
          setHideCallBack(prev => {
            prev?.()
            return callback
          })
        },
        hide: () => {
          if (timerRef.current) {
            window.clearTimeout(timerRef.current)
          }

          if (!mouseInRef.current) {
            timerRef.current = window.setTimeout(() => setVisibility(false), 300)
          }
        }
      } as DynamicPopoverHandlerBinding<T>),
    [setVisibility]
  )

  React.useEffect(() => {
    if (!visible && hideCallback) {
      hideCallback()
      setHideCallBack(undefined)
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [hideCallback, visible])

  React.useEffect(() => {
    bind(handler)
  }, [bind, handler])

  return (
    <>
      {visible && (
        <span
          ref={setPopperElement}
          className={cx(css.dynamicPopover, { [css.dark]: darkModeState }, className)}
          style={styles.popper}
          {...attributes.popper}
          onMouseEnter={() => {
            if (closeOnMouseOut) {
              mouseInRef.current = true
              if (timerRef.current) {
                window.clearTimeout(timerRef.current)
              }
              setVisibility(true)
            }
          }}
          onMouseLeave={() => {
            if (closeOnMouseOut) {
              mouseInRef.current = false
              handler.hide()
            }
          }}
        >
          {data && render(data)}
          {useArrowsState && (
            <div className={css.arrow} data-popper-arrow="true" ref={setArrowElement} style={styles.arrow} />
          )}
        </span>
      )}
    </>
  )
}
