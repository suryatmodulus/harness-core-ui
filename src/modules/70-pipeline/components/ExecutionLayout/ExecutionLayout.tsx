import React from 'react'
import SplitPane, { Pane, SplitPaneProps } from 'react-split-pane'
import { debounce } from 'lodash-es'
import cx from 'classnames'

import { useLocalStorage } from '@common/hooks'
import { ExecutionLayoutContext, ExecutionLayoutState } from './ExecutionLayoutContext'
import ExecutionLayoutFloatingView from './ExecutionLayoutFloatingView'
import ExecutionLayoutToggle from './ExecutionLayoutToggle'

import css from './ExecutionLayout.module.scss'

const IS_TEST = process.env.NODE_ENV === 'test'
export const MIN_PANEL_SIZE = 200
const RIGHT_LAYOUT_DEFAULT_SIZE = 570
const BOTTOM_LAYOUT_DEFAULT_SIZE = 500
const EXECUTION_LAYOUT_DOM_ID = `execution-layout-${IS_TEST ? 'test' : /* istanbul ignore next */ Date.now()}`

const splitPaneProps: Partial<Record<ExecutionLayoutState, SplitPaneProps>> = {
  [ExecutionLayoutState.RIGHT]: {
    split: 'vertical',
    defaultSize: RIGHT_LAYOUT_DEFAULT_SIZE,
    minSize: 300,
    maxSize: -300,
    primary: 'second'
  },
  [ExecutionLayoutState.BOTTOM]: {
    split: 'horizontal',
    defaultSize: BOTTOM_LAYOUT_DEFAULT_SIZE,
    minSize: 200,
    maxSize: -100,
    primary: 'first'
  }
}

export interface ExecutionLayoutProps {
  className?: string
  defaultLayout?: ExecutionLayoutState
  defaultStepVisibility?: boolean
}

function ExecutionLayout(props: React.PropsWithChildren<ExecutionLayoutProps>): React.ReactElement {
  const [child1, child2, child3] = React.Children.toArray(props.children)
  const [layouts, setLayoutState] = useLocalStorage<ExecutionLayoutState[]>(
    'execution_layout_2', // increase the number in case data structure is changed
    [props.defaultLayout || ExecutionLayoutState.RIGHT]
  )
  const [layoutState] = layouts
  const [isStepDetailsVisible, setStepDetailsVisibility] = React.useState(!!props.defaultStepVisibility)
  const [primaryPaneSize, setPrimaryPaneSize] = React.useState(250)
  const [tertiaryPaneSize, setTertiaryPaneSize] = React.useState(
    layoutState === ExecutionLayoutState.RIGHT ? RIGHT_LAYOUT_DEFAULT_SIZE : BOTTOM_LAYOUT_DEFAULT_SIZE
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setStageSplitPaneSizeDebounce = React.useCallback(debounce(setPrimaryPaneSize, 300), [setPrimaryPaneSize])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setStepSplitPaneSizeDebounce = React.useCallback(debounce(setTertiaryPaneSize, 300), [setTertiaryPaneSize])

  /* Ignoring this function as it is used by "react-split-pane" */
  /* istanbul ignore next */
  function handleStageResize(size: number): void {
    setStageSplitPaneSizeDebounce(size)
  }

  function setLayout(e: ExecutionLayoutState): void {
    setLayoutState(prevState => [e, ...prevState.slice(0, 1)])
  }

  function restoreDialog(): void {
    setLayoutState(prevState => {
      const prevNonMinState = prevState.find(s => s !== ExecutionLayoutState.MINIMIZE)

      return [prevNonMinState || ExecutionLayoutState.RIGHT, ExecutionLayoutState.MINIMIZE]
    })
  }

  // handle layout change
  React.useEffect(() => {
    if (layoutState === ExecutionLayoutState.RIGHT) {
      setTertiaryPaneSize(RIGHT_LAYOUT_DEFAULT_SIZE)
    } else if (layoutState === ExecutionLayoutState.BOTTOM) {
      setTertiaryPaneSize(BOTTOM_LAYOUT_DEFAULT_SIZE)
    }
  }, [layoutState])

  return (
    <ExecutionLayoutContext.Provider
      value={{
        layout: layoutState,
        setLayout,
        primaryPaneSize,
        tertiaryPaneSize,
        setPrimaryPaneSize,
        setTertiaryPaneSize,
        isStepDetailsVisible,
        setStepDetailsVisibility,
        restoreDialog
      }}
    >
      <div className={cx(css.main, props.className)} id={EXECUTION_LAYOUT_DOM_ID}>
        <SplitPane
          split="horizontal"
          className={css.splitPane1}
          minSize={MIN_PANEL_SIZE}
          size={primaryPaneSize}
          onChange={handleStageResize}
        >
          <Pane className={css.pane11}>{child1}</Pane>
          <Pane className={css.pane12}>
            {isStepDetailsVisible &&
            (layoutState === ExecutionLayoutState.BOTTOM || layoutState === ExecutionLayoutState.RIGHT) ? (
              <SplitPane
                className={css.splitPane2}
                {...splitPaneProps[layoutState]}
                size={tertiaryPaneSize}
                onChange={setStepSplitPaneSizeDebounce}
              >
                <Pane className={css.pane21}>{child2}</Pane>
                <Pane className={css.pane22}>{child3}</Pane>
              </SplitPane>
            ) : (
              <React.Fragment>
                {child2}
                {isStepDetailsVisible ? <ExecutionLayoutFloatingView>{child3}</ExecutionLayoutFloatingView> : null}
              </React.Fragment>
            )}
          </Pane>
        </SplitPane>
      </div>
    </ExecutionLayoutContext.Provider>
  )
}

ExecutionLayout.Toggle = ExecutionLayoutToggle
export default ExecutionLayout
