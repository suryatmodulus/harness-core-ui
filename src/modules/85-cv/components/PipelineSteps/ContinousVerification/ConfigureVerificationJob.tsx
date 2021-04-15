import React, { useEffect } from 'react'
import { SelectOption, FormInput, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import type { FormikProps } from 'formik'
import cx from 'classnames'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { VerificationJobDTO } from 'services/cv'
import {
  VerificationSensitivity,
  Duration,
  BaselineSelect,
  TrafficSplit
} from '@cv/pages/verification-jobs/VerificationJobForms/VerificationJobFields'
import { useStrings } from 'framework/exports'
import type { ContinousVerificationFormData } from './continousVerificationTypes'
import {
  baseLineOptions,
  durationOptions,
  IdentifierTypes,
  JobTypes,
  trafficSplitPercentageOptions,
  VerificationSensitivityOptions
} from './constants'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function ConfigureVerificationJob(props: {
  formik: FormikProps<ContinousVerificationFormData>
  jobContents: VerificationJobDTO[] | undefined
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    formik,
    jobContents
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const selectedJobValue =
    (formValues?.spec?.verificationJobRef as SelectOption)?.value || formValues?.spec?.verificationJobRef
  const selectedJob = selectedJobValue
    ? jobContents?.find((el: VerificationJobDTO) => el.identifier === selectedJobValue)
    : null
  const specInfo = formValues?.spec?.spec

  const isFieldDisabled = (
    formField: SelectOption | string | undefined,
    selectedJobField: string | undefined
  ): boolean => {
    const isFormNotModified = (formField as SelectOption)?.value?.toString() === selectedJobField
    return isFormNotModified
  }

  const renderConfigOptions = (): JSX.Element => {
    switch (selectedJob?.type) {
      case getString('cv.connectors.cdng.jobTypes.test'):
        return (
          <>
            <div className={cx(stepCss.formGroup)}>
              <VerificationSensitivity
                label={getString('sensitivity')}
                name={`spec.spec.sensitivity`}
                expressions={expressions}
                disabled={isFieldDisabled(specInfo?.sensitivity, selectedJob?.sensitivity)}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <Duration
                name={`spec.spec.duration`}
                label={getString('cv.connectors.cdng.duration')}
                expressions={expressions}
                disabled={isFieldDisabled(specInfo?.duration, selectedJob?.duration)}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <BaselineSelect
                name={`spec.spec.baseline`}
                label={getString('cv.connectors.cdng.baseline')}
                expressions={expressions}
                disabled={isFieldDisabled(specInfo?.baseline, selectedJob?.baselineVerificationJobInstanceId)}
                formik={formik}
              />
            </div>
          </>
        )
      case getString('cv.connectors.cdng.jobTypes.blueGreen'):
      case getString('cv.connectors.cdng.jobTypes.canary'):
        return (
          <>
            <div className={cx(stepCss.formGroup)}>
              <VerificationSensitivity
                label={getString('sensitivity')}
                name={`spec.spec.sensitivity`}
                expressions={expressions}
                disabled={isFieldDisabled(specInfo?.sensitivity, selectedJob?.sensitivity)}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <Duration
                name={`spec.spec.duration`}
                label={getString('cv.connectors.cdng.duration')}
                expressions={expressions}
                disabled={isFieldDisabled(specInfo?.duration, selectedJob.duration)}
                formik={formik}
              />
            </div>
            <div className={cx(stepCss.formGroup)}>
              <TrafficSplit
                name={`spec.spec.trafficsplit`}
                label={getString('cv.connectors.cdng.trafficsplit')}
                disabled={isFieldDisabled(specInfo?.trafficsplit, selectedJob?.trafficSplitPercentage?.toString())}
                formik={formik}
              />
            </div>
          </>
        )
      case getString('cv.connectors.cdng.jobTypes.health'):
        return (
          <div className={cx(stepCss.formGroup)}>
            <Duration
              name={`spec.spec.duration`}
              label={getString('cv.connectors.cdng.duration')}
              expressions={expressions}
              disabled={isFieldDisabled(specInfo?.duration, selectedJob.duration)}
              formik={formik}
            />
          </div>
        )
      default:
        return <></>
    }
  }

  const getFieldDataFromSelectedJob = (
    selectedJobField: string,
    options: SelectOption[]
  ): SelectOption | string | undefined => {
    let field: SelectOption | string | undefined
    if (selectedJob) {
      // if selected job is configured with run time param then user should be able to select anything
      if (selectedJob[selectedJobField]?.toString() === RUNTIME_INPUT_VALUE) {
        field = ''
      } else {
        field = options.find((el: SelectOption) => el.value === selectedJob[selectedJobField])
      }
    }
    return field
  }

  const getFieldDataFromForm = (
    selectedJobField: string,
    options: SelectOption[]
  ): SelectOption | string | undefined => {
    let completeFieldData: SelectOption | string | undefined
    if (specInfo) {
      // If form is modified then getting values from FORM
      if (specInfo[selectedJobField]) {
        if (specInfo[selectedJobField] === RUNTIME_INPUT_VALUE || specInfo[selectedJobField].value) {
          //if the user selects a fixed or run time value
          completeFieldData = specInfo[selectedJobField]
        }
      } else {
        // if form is not modified , then fetching info from the selected job
        completeFieldData = getFieldDataFromSelectedJob(selectedJobField, options)
      }
    }
    return completeFieldData
  }

  useEffect(() => {
    if (selectedJob) {
      const sensitivity = getFieldDataFromForm('sensitivity', VerificationSensitivityOptions)
      const duration = getFieldDataFromForm('duration', durationOptions)
      const trafficsplit = getFieldDataFromForm('trafficSplitPercentage', trafficSplitPercentageOptions)
      const baseline = getFieldDataFromForm('baselineVerificationJobInstanceId', baseLineOptions)
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
    return <>{getString('cv.connectors.cdng.selectTheJobNameFirst')}</>
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
            label={getString('cv.connectors.cdng.deploymentTag')}
            name="spec.spec.deploymentTag"
            multiTextInputProps={{ expressions }}
          />
        </div>
      </>
    )
  }
}
