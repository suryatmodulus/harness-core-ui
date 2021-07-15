import React from 'react'
import { FormInput } from '@wings-software/uicore'

import type { FormikProps } from 'formik'
import cx from 'classnames'

import { useEffect } from 'react'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  VerificationSensitivity,
  Duration,
  BaselineSelect,
  TrafficSplit
} from '@cv/pages/verification-jobs/VerificationJobForms/VerificationJobFields'
import { useStrings } from 'framework/strings'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import Card from '@cv/components/Card/Card'
import { defaultDeploymentTag, VerificationTypes } from './constants'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function ConfigureFields(props: { formik: FormikProps<ContinousVerificationData> }): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    formik
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const renderConfigOptions = (): JSX.Element => {
    switch (formValues?.spec?.type) {
      case VerificationTypes.LoadTest:
        return (
          <>
            <div className={cx(stepCss.formGroup)}>
              <VerificationSensitivity
                label={getString('sensitivity')}
                name={`spec.spec.sensitivity`}
                expressions={expressions}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <Duration
                name={`spec.spec.duration`}
                label={getString('duration')}
                expressions={expressions}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <BaselineSelect
                name={`spec.spec.baseline`}
                label={getString('connectors.cdng.baseline')}
                expressions={expressions}
                formik={formik}
              />
            </div>
          </>
        )
      case VerificationTypes.Bluegreen:
      case VerificationTypes.Canary:
      case VerificationTypes.Rolling:
        return (
          <>
            <div className={cx(stepCss.formGroup)}>
              <VerificationSensitivity
                label={getString('sensitivity')}
                name={`spec.spec.sensitivity`}
                expressions={expressions}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <Duration
                name={`spec.spec.duration`}
                label={getString('duration')}
                expressions={expressions}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <TrafficSplit
                name={`spec.spec.trafficsplit`}
                label={getString('connectors.cdng.trafficsplit')}
                expressions={expressions}
                formik={formik}
              />
            </div>
          </>
        )
      default:
        return <></>
    }
  }

  useEffect(() => {
    const deploymentTag = formValues?.spec?.spec?.deploymentTag || defaultDeploymentTag
    const updatedSpecs = {
      spec: {
        ...formValues.spec.spec,
        deploymentTag
      }
    }
    setFieldValue('spec', { ...formValues.spec, ...updatedSpecs })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card>
      <>
        {renderConfigOptions()}
        <div className={cx(stepCss.formGroup)}>
          <FormInput.MultiTextInput
            label={getString('connectors.cdng.deploymentTag')}
            name="spec.spec.deploymentTag"
            multiTextInputProps={{ expressions }}
          />
        </div>
      </>
    </Card>
  )
}
