import React from 'react'
// import { getMultiTypeFromValue, MultiTypeInputType, SelectOption, FormInput } from '@wings-software/uicore'
// import { isEmpty } from 'lodash-es'

// import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
// import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import type { FlagConfigurationStepFormData, FlagConfigurationStepData } from './types'
// import { httpStepType } from './HttpStepBase'

export interface FlagConfigurationInputSetStepProps {
  initialValues: FlagConfigurationStepFormData
  onUpdate?: (data: FlagConfigurationStepFormData) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: FlagConfigurationStepData
  path: string
}

export default function FlagConfigurationInputSetStep(_props: FlagConfigurationInputSetStepProps): React.ReactElement {
  // const { template, onUpdate, initialValues, path, readonly } = props
  // const { getString } = useStrings()
  // const prefix = isEmpty(path) ? '' : `${path}.`

  // console.log('FlagConfigurationInputSetStep: ', props)
  return (
    <React.Fragment>
      FlagConfigurationInputSetStep: To be implemented...
      {/* {getMultiTypeFromValue(template?.spec?.url) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Text label={getString('UrlLabel')} name={`${prefix}spec.url`} disabled={readonly} />
      ) : null}
      {getMultiTypeFromValue(template?.spec?.method) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Select
          label={getString('methodLabel')}
          name={`${prefix}spec.method`}
          items={httpStepType}
          onChange={(opt: SelectOption) => {
            onUpdate?.({ ...initialValues, spec: { ...initialValues.spec, method: opt.value.toString() } })
          }}
          disabled={readonly}
        />
      ) : null}
      {getMultiTypeFromValue(template?.spec?.requestBody) === MultiTypeInputType.RUNTIME ? (
        <FormInput.TextArea
          label={getString('requestBodyLabel')}
          name={`${prefix}spec.requestBody`}
          style={{ resize: 'vertical' }}
          disabled={readonly}
        />
      ) : null}
      {getMultiTypeFromValue(template?.spec?.assertion) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Text label={getString('assertionLabel')} name={`${prefix}spec.assertion`} disabled={readonly} />
      ) : null}
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
        />
      ) : null} */}
    </React.Fragment>
  )
}
