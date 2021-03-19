import React, { useState, useMemo } from 'react'
import { usePopper } from 'react-popper'
import cx from 'classnames'
import type * as PopperJS from '@popperjs/core'
import css from './DynamicPopover.module.scss'

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
}

export function DynamicPopover<T>(props: DynamicPopoverProps<T>): JSX.Element {
  const { bind, render, className = '', darkMode = false, useArrows = true } = props
  const [darkModeState, setDarkMode] = useState<boolean>(darkMode)
  const [useArrowsState, setArrowVisibility] = useState<boolean>(useArrows)

  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null)
  const [data, setData] = useState<T>()
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null)
  const [referenceElement, setReferenceElement] = useState<Element | PopperJS.VirtualElement | null>(null)
  const [visible, setVisibility] = useState<boolean>(false)
  const [hideCallback, setHideCallBack] = useState<() => void | undefined>()

  const handler = useMemo(
    () =>
      ({
        show: (ref, dataTemp, options, callback) => {
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
          setVisibility(false)
        }
      } as DynamicPopoverHandlerBinding<T>),
    []
  )

  React.useEffect(() => {
    if (!visible && hideCallback) {
      hideCallback()
      setHideCallBack(undefined)
    }
  }, [hideCallback, visible])

  React.useEffect(() => {
    bind(handler)
  }, [bind, handler])

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'arrow', options: { element: arrowElement } }]
  })

  return (
    <>
      {visible && (
        <span
          ref={setPopperElement}
          className={cx(css.dynamicPopover, { [css.dark]: darkModeState }, className)}
          style={styles.popper}
          {...attributes.popper}
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
