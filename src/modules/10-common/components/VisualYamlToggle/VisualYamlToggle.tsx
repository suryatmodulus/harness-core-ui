import React, { SetStateAction, Dispatch } from 'react'
import { useStrings } from 'framework/strings'
import { Toggle, ToggleProps } from '@common/components/Toggle/Toggle'

export enum SelectedView {
  VISUAL = 'VISUAL',
  YAML = 'YAML'
}

interface VisualYamlToggleInterface {
  initialSelectedView?: SelectedView
  beforeOnChange: (val: SelectedView, callbackFn: Dispatch<SetStateAction<SelectedView>>) => void
  disableYaml?: boolean
  className?: string
}

export default function VisualYamlToggle(props: VisualYamlToggleInterface): JSX.Element {
  const { initialSelectedView, beforeOnChange, disableYaml = false, className = '' } = props
  const { getString } = useStrings()

  const toggleProps: ToggleProps<SelectedView> = {
    initialSelectedView,
    options: [
      {
        label: getString('visual'),
        value: SelectedView.VISUAL
      },
      {
        label: getString('yaml'),
        value: SelectedView.YAML
      }
    ],
    beforeOnChange,
    disableSwitch: disableYaml,
    className
  }

  return <Toggle {...toggleProps} />
}
