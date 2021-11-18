import React from 'react'
import BaseContinousVerification from './components/BaseContinousVerification/BaseContinousVerification'
import type { ContinousVerificationWidgetSectionsProps } from './types'
import SelectVerificationType from './components/SelectVerificationType/SelectVerificationType'
import ConfigureFields from './components/ConfigureFields/ConfigureFields'
import MonitoredService from './components/MonitoredService/MonitoredService'

export function ContinousVerificationWidgetSections({
  formik,
  isNewStep,
  stepViewType,
  allowableTypes
}: ContinousVerificationWidgetSectionsProps): JSX.Element {
  return (
    <>
      <BaseContinousVerification
        formik={formik}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
      />
      <SelectVerificationType />
      <MonitoredService formik={formik} />
      {formik?.values?.spec?.type ? <ConfigureFields formik={formik} allowableTypes={allowableTypes} /> : null}
    </>
  )
}
