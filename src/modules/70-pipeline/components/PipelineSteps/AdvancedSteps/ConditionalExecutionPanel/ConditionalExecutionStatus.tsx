import React from 'react'
import { Radio, RadioGroup } from '@blueprintjs/core'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { Modes } from '../common'
import {
  ConditionalExecutionOption,
  ModeEntityNameMap,
  ParentModeEntityNameMap,
  PipelineOrStageStatus
} from './ConditionalExecutionPanelUtils'
import css from './ConditionalExecutionPanel.module.scss'

interface ConditionalExecutionStatusProps {
  formikProps: FormikProps<ConditionalExecutionOption>
  mode: Modes
  isReadonly: boolean
}

export default function ConditionalExecutionStatus(props: ConditionalExecutionStatusProps): React.ReactElement {
  const { getString } = useStrings()
  const { formikProps, mode, isReadonly } = props
  const strVariables = {
    entity: ModeEntityNameMap[mode],
    parentEntity: ParentModeEntityNameMap[mode]
  }

  return (
    <RadioGroup
      selectedValue={formikProps.values.status}
      disabled={isReadonly}
      onChange={e => {
        formikProps.setFieldValue('status', e.currentTarget.value)
      }}
    >
      <Radio
        value={PipelineOrStageStatus.SUCCESS}
        label={getString('pipeline.conditionalExecution.statusOption.success', strVariables)}
        className={cx(css.blackText, { [css.active]: formikProps.values.status === PipelineOrStageStatus.SUCCESS })}
      />
      {mode === Modes.STAGE && <br />}
      <Radio
        value={PipelineOrStageStatus.ALL}
        label={getString('pipeline.conditionalExecution.statusOption.all', strVariables)}
        className={cx(css.blackText, { [css.active]: formikProps.values.status === PipelineOrStageStatus.ALL })}
      />
      {mode === Modes.STAGE && <br />}
      <Radio
        value={PipelineOrStageStatus.FAILURE}
        label={getString('pipeline.conditionalExecution.statusOption.failure', strVariables)}
        className={cx(css.blackText, { [css.active]: formikProps.values.status === PipelineOrStageStatus.FAILURE })}
      />
    </RadioGroup>
  )
}
