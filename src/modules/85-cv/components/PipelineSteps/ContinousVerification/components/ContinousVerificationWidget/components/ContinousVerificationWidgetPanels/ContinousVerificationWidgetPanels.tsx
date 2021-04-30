import React, { useEffect } from 'react'
import { Accordion, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import BaseContinousVerification from './components/BaseContinousVerification'
import ConfigureVerificationJob from './components/ConfigureVerificationJob/ConfigureVerificationJob'
import type { ContinousVerificationWidgetPanelsProps } from './types'
import type { VerificationJob } from '../../types'
import DefineVerificationJob from './components/DefineVerificationJob'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1485670459/Continous+Verification+Step
 */

export function ContinousVerificationWidgetPanels({
  formik: { values: formValues, setFieldValue },
  formik,
  isNewStep,
  jobContents,
  loading,
  error
}: ContinousVerificationWidgetPanelsProps): JSX.Element {
  const { getString } = useStrings()

  useEffect(() => {
    if (jobContents && !loading && !error && formValues?.spec?.verificationJobRef) {
      let verificationJobRef: SelectOption | undefined

      jobContents.forEach((el: VerificationJob) => {
        if (el.identifier === formValues?.spec.verificationJobRef) {
          verificationJobRef = { value: el.identifier as string, label: el.jobName as string }
        }
      })

      if (verificationJobRef) {
        const newValues = { verificationJobRef }
        const newSpecs = { ...formValues.spec, ...newValues }
        setFieldValue('spec', newSpecs)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobContents, error, loading, formValues?.spec?.verificationJobRef])

  return (
    <Accordion activeId="step-1" className={stepCss.accordion}>
      <Accordion.Panel
        id="step-1"
        summary={getString('basic')}
        details={<BaseContinousVerification formik={formik} isNewStep={isNewStep} />}
      />
      <Accordion.Panel
        id="step-2"
        summary={getString('connectors.cdng.defineVerificationJob')}
        details={<DefineVerificationJob formik={formik} jobContents={jobContents} loading={loading} error={error} />}
      />
      <Accordion.Panel
        id="step-3"
        summary={getString('connectors.cdng.configureVerificationJob')}
        details={<ConfigureVerificationJob formik={formik} jobContents={jobContents} />}
      />
    </Accordion>
  )
}
