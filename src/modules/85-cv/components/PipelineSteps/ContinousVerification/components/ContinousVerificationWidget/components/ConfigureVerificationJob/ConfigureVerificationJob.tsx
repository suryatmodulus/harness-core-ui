import React, { useEffect } from 'react'
import { SelectOption, FormInput, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import type { FormikProps } from 'formik'
import cx from 'classnames'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  VerificationSensitivity,
  Duration,
  BaselineSelect,
  TrafficSplit,
  getVerificationSensitivityOptions
} from '@cv/pages/verification-jobs/VerificationJobForms/VerificationJobFields'
import { useStrings } from 'framework/strings'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import {
  durationOptions,
  trafficSplitPercentageOptions,
  baseLineOptions,
  IdentifierTypes,
  JobTypes
} from '@cv/components/PipelineSteps/ContinousVerification/constants'
import { getFieldDataFromForm, isFieldDisabled } from './utils'
import type { VerificationJob } from '../../types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function ConfigureVerificationJob(props: {
  formik: FormikProps<ContinousVerificationData>
  jobContents: VerificationJob[] | undefined
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    formik,
    jobContents
  } = props
  const { getString } = useStrings()
  const verificationSensitivityOptions = getVerificationSensitivityOptions(getString)
  const { expressions } = useVariablesExpression()
  const selectedJobValue =
    (formValues?.spec?.verificationJobRef as SelectOption)?.value || formValues?.spec?.verificationJobRef
  const selectedJob = selectedJobValue
    ? jobContents?.find((el: VerificationJob) => el.identifier === selectedJobValue)
    : null
  const specInfo = formValues?.spec?.spec

  const renderConfigOptions = (): JSX.Element => {
    switch (selectedJob?.type) {
      case 'TEST':
        return (
          <>
            <div className={cx(stepCss.formGroup)}>
              <VerificationSensitivity
                label={getString('sensitivity')}
                name={`spec.spec.sensitivity`}
                expressions={expressions}
                isSimpleDropdown={isFieldDisabled(specInfo?.sensitivity, selectedJob?.sensitivity)}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <Duration
                name={`spec.spec.duration`}
                label={getString('duration')}
                expressions={expressions}
                isSimpleDropdown={isFieldDisabled(specInfo?.duration, selectedJob?.duration)}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <BaselineSelect
                name={`spec.spec.baseline`}
                label={getString('connectors.cdng.baseline')}
                expressions={expressions}
                isSimpleDropdown={isFieldDisabled(specInfo?.baseline, selectedJob?.baselineVerificationJobInstanceId)}
                formik={formik}
              />
            </div>
          </>
        )
      case 'BLUE_GREEN':
      case 'CANARY':
        return (
          <>
            <div className={cx(stepCss.formGroup)}>
              <VerificationSensitivity
                label={getString('sensitivity')}
                name={`spec.spec.sensitivity`}
                expressions={expressions}
                isSimpleDropdown={isFieldDisabled(specInfo?.sensitivity, selectedJob?.sensitivity)}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <Duration
                name={`spec.spec.duration`}
                label={getString('duration')}
                expressions={expressions}
                isSimpleDropdown={isFieldDisabled(specInfo?.duration, selectedJob.duration)}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <TrafficSplit
                name={`spec.spec.trafficsplit`}
                label={getString('connectors.cdng.trafficsplit')}
                isSimpleDropdown={isFieldDisabled(
                  specInfo?.trafficsplit,
                  selectedJob?.trafficSplitPercentage?.toString()
                )}
                formik={formik}
              />
            </div>
          </>
        )
      case 'HEALTH':
        return (
          <div className={cx(stepCss.formGroup)}>
            <Duration
              name={`spec.spec.duration`}
              label={getString('duration')}
              expressions={expressions}
              isSimpleDropdown={isFieldDisabled(specInfo?.duration, selectedJob.duration)}
              formik={formik}
            />
          </div>
        )
      default:
        return <></>
    }
  }

  useEffect(() => {
    if (selectedJob) {
      const sensitivity = getFieldDataFromForm('sensitivity', verificationSensitivityOptions, specInfo, selectedJob)
      const duration = getFieldDataFromForm('duration', durationOptions, specInfo, selectedJob)
      const trafficsplit = getFieldDataFromForm(
        'trafficSplitPercentage',
        trafficSplitPercentageOptions,
        specInfo,
        selectedJob
      )
      const baseline = getFieldDataFromForm('baselineVerificationJobInstanceId', baseLineOptions, specInfo, selectedJob)
      const serviceRef =
        selectedJob.serviceIdentifier === RUNTIME_INPUT_VALUE
          ? IdentifierTypes.serviceIdentifier
          : selectedJob.serviceIdentifier
      const envRef =
        selectedJob.envIdentifier === RUNTIME_INPUT_VALUE ? IdentifierTypes.envIdentifier : selectedJob.envIdentifier

      const updatedSpecs = {
        type: selectedJob.type && JobTypes[selectedJob.type],
        spec: {
          ...formValues.spec.spec,
          sensitivity,
          duration,
          trafficsplit,
          baseline,
          serviceRef,
          envRef
        }
      }
      setFieldValue('spec', { ...formValues.spec, ...updatedSpecs })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!selectedJobValue) {
    return <>{getString('connectors.cdng.selectTheJobNameFirst')}</>
  } else {
    return (
      <>
        <div className={cx(stepCss.formGroup)}>
          <FormInput.Text name="spec.spec.serviceRef" label={getString('service')} disabled={true} />
        </div>
        <div className={cx(stepCss.formGroup)}>
          <FormInput.Text name="spec.spec.envRef" label={getString('environment')} disabled={true} />
        </div>
        {renderConfigOptions()}
        <div className={cx(stepCss.formGroup)}>
          <FormInput.MultiTextInput
            label={getString('connectors.cdng.deploymentTag')}
            name="spec.spec.deploymentTag"
            multiTextInputProps={{ expressions }}
          />
        </div>
      </>
    )
  }
}
