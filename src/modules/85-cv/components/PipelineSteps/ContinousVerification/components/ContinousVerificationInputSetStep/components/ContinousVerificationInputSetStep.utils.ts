import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { NgPipeline } from 'services/cd-ng'
import type { serviceAndEnvData } from '../types'

export const getInfraAndServiceData = (
  pipeline: { pipeline: NgPipeline } | undefined,
  formik: any
): serviceAndEnvData => {
  const currentStageFromPipeline = pipeline?.pipeline?.stages?.find(
    (el: any) => el?.stage?.identifier === formik?.values?.identifier
  )
  const currentStageFromForm = formik?.values?.stages?.find(
    (el: any) => el?.stage?.identifier === formik?.values?.identifier
  )
  let serviceIdentifierData = currentStageFromPipeline?.stage?.spec?.serviceConfig?.serviceRef
  let envIdentifierData = currentStageFromPipeline?.stage?.spec?.infrastructure?.environmentRef
  if (serviceIdentifierData === RUNTIME_INPUT_VALUE) {
    serviceIdentifierData = currentStageFromForm?.stage?.spec?.serviceConfig?.serviceRef
  }
  if (envIdentifierData === RUNTIME_INPUT_VALUE) {
    envIdentifierData = currentStageFromForm?.stage?.spec?.infrastructure?.environmentRef
  }
  return { serviceIdentifierData, envIdentifierData }
}
