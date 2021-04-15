import React from 'react'
import cx from 'classnames'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/exports'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ContinousVerificationFormData } from './continousVerificationTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function BaseContinousVerification(props: {
  formik: FormikProps<ContinousVerificationFormData>
  isNewStep?: boolean
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    isNewStep = true
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.InputWithIdentifier
          isIdentifierEditable={isNewStep}
          inputLabel={getString('pipelineSteps.stepNameLabel')}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{ enableConfigureOptions: false, expressions }}
        />
        {getMultiTypeFromValue(formValues.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.timeout || ''}
            type="String"
            variableName="timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => setFieldValue('timeout', value)}
          />
        )}
      </div>
    </>
  )
}
