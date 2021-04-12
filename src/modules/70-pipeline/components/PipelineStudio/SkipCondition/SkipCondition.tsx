import React from 'react'
import { Classes } from '@blueprintjs/core'
import { Formik } from 'formik'
import { debounce } from 'lodash-es'

import SkipConditionsPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/SkipConditionsPanel/SkipConditionsPanel'
import { Modes } from '@pipeline/components/PipelineSteps/AdvancedSteps/common'

/*
Formik blanket over SkipConditionsPanel - with validationschema and submit button
SkipConditionsPanel is the original form - used in stage/steps and step groups.
This file will be used for stage level skip conditions, hence passing the mode = STAGE
*/
export interface SkipConditionProps {
  selectedStage: any
  isReadonly: boolean
  onUpdate(data: { skipCondition: string }): void
}

export default function SkipCondition(props: SkipConditionProps): React.ReactElement {
  const {
    selectedStage: { stage },
    onUpdate,
    isReadonly
  } = props
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(debounce(onUpdate, 300), [onUpdate])

  return (
    <Formik
      initialValues={{
        skipCondition: stage.skipCondition || ''
      }}
      onSubmit={onUpdate}
      validate={debouncedUpdate}
    >
      <div className={Classes.DIALOG_BODY}>
        <SkipConditionsPanel isReadonly={isReadonly} mode={Modes.STAGE} />
      </div>
    </Formik>
  )
}
