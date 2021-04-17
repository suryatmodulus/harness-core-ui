import React from 'react'
import Draggable from 'react-draggable'
import { usePopper } from 'react-popper'
import { Button } from '@wings-software/uicore'
import cx from 'classnames'

import { useLocalStorage } from '@common/hooks'

import { useExecutionLayoutContext } from './ExecutionLayoutContext'
import css from './ExecutionLayout.module.scss'

/**
 * This component will only be rendered when layout === 'FLOATING'
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export default function ExecutionLayoutFloatingView(props: React.PropsWithChildren<{}>): React.ReactElement {
  const { layout } = useExecutionLayoutContext()
  const [position, setPosition] = useLocalStorage('execution_layout_float_position', { x: -40, y: -30 })
  const [isOpen, setIsOpen] = React.useState(true)
  const [referenceElement, setReferenceElement] = React.useState<HTMLElement | null>(null)
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-end',
    modifiers: [
      {
        name: 'offset',
        options: { offset: [0, 12] }
      }
    ]
  })

  function toggleDialog(): void {
    setIsOpen(status => !status)
  }

  React.useEffect(() => {
    setIsOpen(true)
  }, [layout])

  return (
    <div className={css.floatingView} data-state={layout.toLowerCase()}>
      {
        <Draggable
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          offsetParent={document.getElementById('pipeline-execution-container')!}
          disabled={isOpen}
          position={position}
          onStop={(_e, data) => setPosition({ x: data.x, y: data.y })}
        >
          <div className={cx(css.stepDetails, { [css.draggable]: !isOpen })} ref={setReferenceElement}>
            <span>Step Details</span>
            <Button onClick={toggleDialog} rightIcon={isOpen ? 'minus' : 'plus'} minimal small intent="primary" />
          </div>
        </Draggable>
      }
      {isOpen ? (
        <div className="floating-wrapper" ref={setPopperElement} {...attributes.popper} style={styles.popper}>
          {props.children}
        </div>
      ) : null}
    </div>
  )
}
