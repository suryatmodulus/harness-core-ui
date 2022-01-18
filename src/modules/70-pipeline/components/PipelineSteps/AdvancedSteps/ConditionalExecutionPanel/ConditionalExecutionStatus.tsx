/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Radio, RadioGroup } from '@blueprintjs/core'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
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
