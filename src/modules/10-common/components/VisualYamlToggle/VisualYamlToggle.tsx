import React, { SetStateAction, Dispatch } from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './VisualYamlToggle.module.scss'

export enum SelectedView {
  VISUAL = 'VISUAL',
  YAML = 'YAML'
}

interface VisualYamlToggleInterface {
  initialSelectedView?: SelectedView
  beforeOnChange: (val: SelectedView, callbackFn: Dispatch<SetStateAction<SelectedView>>) => void
  disableYaml?: boolean
}

export default function VisualYamlToggle(props: VisualYamlToggleInterface): JSX.Element {
  const { initialSelectedView, beforeOnChange, disableYaml = false } = props
  const [selectedView, setSelectedView] = React.useState<SelectedView>(initialSelectedView || SelectedView.VISUAL)
  const { getString } = useStrings()

  return (
    <div className={css.optionBtns}>
      <div
        data-name="visual-btn"
        className={cx(css.item, { [css.selected]: selectedView === SelectedView.VISUAL })}
        onClick={() => {
          if (selectedView === SelectedView.VISUAL) {
            return
          }
          beforeOnChange(SelectedView.VISUAL, setSelectedView)
        }}
        tabIndex={0}
        role="button"
      >
        {getString('visual')}
      </div>
      <div
        data-name="yaml-btn"
        className={cx(css.item, {
          [css.selected]: selectedView === SelectedView.YAML,
          [css.disabledMode]: disableYaml
        })}
        onClick={() => {
          beforeOnChange(SelectedView.YAML, setSelectedView)
        }}
        tabIndex={0}
        role="button"
      >
        {getString('yaml')}
      </div>
    </div>
  )
}
