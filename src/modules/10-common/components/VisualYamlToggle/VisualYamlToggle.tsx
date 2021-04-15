import React, { SetStateAction, Dispatch } from 'react'
import cx from 'classnames'
import { useStrings } from 'framework/exports'
import css from './VisualYamlToggle.module.scss'

export enum SelectedView {
  VISUAL = 'VISUAL',
  YAML = 'YAML'
}

interface VisualYamlToggleInterface {
  onChange: (val: SelectedView, callbackFn: Dispatch<SetStateAction<SelectedView>>) => void
}

export default function VisualYamlToggle(props: VisualYamlToggleInterface): JSX.Element {
  const { onChange } = props
  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const { getString } = useStrings()

  return (
    <div className={css.optionBtns}>
      <div
        className={cx(css.item, { [css.selected]: selectedView === SelectedView.VISUAL })}
        onClick={() => {
          onChange(SelectedView.VISUAL, setSelectedView)
        }}
        tabIndex={0}
        role="button"
      >
        {getString('visual')}
      </div>
      <div
        className={cx(css.item, { [css.selected]: selectedView === SelectedView.YAML })}
        onClick={() => {
          onChange(SelectedView.YAML, setSelectedView)
        }}
        tabIndex={0}
        role="button"
      >
        {getString('yaml')}
      </div>
    </div>
  )
}
