/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, HarnessDocTooltip } from '@wings-software/uicore'
import { Checkbox } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import type { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { useVariablesExpression } from '../../../PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ConditionalExecutionOption } from './ConditionalExecutionPanelUtils'
import { ModeEntityNameMap } from './ConditionalExecutionPanelUtils'
import css from './ConditionalExecutionPanel.module.scss'

interface ConditionalExecutionConditionProps {
  formikProps: FormikProps<ConditionalExecutionOption>
  mode: Modes
  isReadonly: boolean
}

export default function ConditionalExecutionCondition(props: ConditionalExecutionConditionProps): React.ReactElement {
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { formikProps, mode, isReadonly } = props

  return (
    <>
      <Checkbox
        name="enableJEXL"
        checked={formikProps.values.enableJEXL}
        disabled={isReadonly}
        className={cx(css.blackText, { [css.active]: formikProps.values.enableJEXL })}
        labelElement={
          <span data-tooltip-id="conditionalExecution">
            {getString('pipeline.conditionalExecution.condition', { entity: ModeEntityNameMap[mode] })}
            <HarnessDocTooltip tooltipId="conditionalExecution" useStandAlone={true} />
          </span>
        }
        onChange={e => {
          const isChecked = e.currentTarget.checked
          formikProps.setFieldValue('enableJEXL', isChecked)
          if (!isChecked) {
            formikProps.setFieldValue('condition', null)
          }
        }}
      />
      <Container padding={{ top: 'small', left: 'large' }}>
        <MonacoTextField
          name="condition"
          expressions={expressions}
          disabled={!formikProps.values.enableJEXL || isReadonly}
        />
      </Container>
    </>
  )
}
