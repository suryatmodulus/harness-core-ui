import React from 'react'
import { Color, FormInput } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '../../../PipelineStudio/PiplineHooks/useVariablesExpression'
import type { Modes } from '../common'
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
      <FormInput.CheckBox
        name={'enableJEXL'}
        disabled={isReadonly}
        color={Color.GREY_900}
        font={formikProps.values.enableJEXL ? { weight: 'semi-bold' } : {}}
        label={' ' + getString('pipeline.conditionalExecution.condition', { entity: ModeEntityNameMap[mode] })}
      />
      <FormInput.ExpressionInput
        name={'condition'}
        className={css.expressionInput}
        expressionInputProps={{ disabled: !formikProps.values.enableJEXL || isReadonly }}
        items={expressions}
      />
    </>
  )
}
