import React from 'react'

import { Text, FormInput } from '@wings-software/uicore'
import { String } from 'framework/exports'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { Modes } from '../common'
import css from '../AdvancedSteps.module.scss'

export interface SkipConditionPanelProps {
  mode?: Modes
  isReadonly: boolean
}

export const skipConditionsNgDocsLink = 'https://ngdocs.harness.io/article/i36ibenkq2-step-skip-condition-settings'

export default function SkipConditionsPanel(props: SkipConditionPanelProps): React.ReactElement {
  const { expressions } = useVariablesExpression()
  const labelStringID = props.mode === Modes.STAGE ? 'skipConditionStageLabel' : 'skipConditionLabel'
  const helpTextStringId = props.mode === Modes.STAGE ? 'skipConditionText' : 'skipConditionHelpText'
  return (
    <>
      <Text className={css.skipConditionLabel} font={{ weight: 'semi-bold' }} margin={{ bottom: 'large' }}>
        <String stringID={labelStringID} />
      </Text>
      <FormInput.ExpressionInput
        expressionInputProps={{ disabled: props.isReadonly, inputProps: { disabled: props.isReadonly } }}
        items={expressions}
        name="skipCondition"
        label=""
      />
      <Text font="small" style={{ whiteSpace: 'break-spaces' }}>
        <String stringID={helpTextStringId} />
        <br />
        <a href={skipConditionsNgDocsLink} target="_blank" rel="noreferrer">
          <String stringID="learnMore" />
        </a>
      </Text>
    </>
  )
}
