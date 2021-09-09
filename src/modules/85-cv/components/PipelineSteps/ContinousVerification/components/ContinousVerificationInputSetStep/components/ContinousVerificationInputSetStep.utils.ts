import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { DeploymentStageConfig, PipelineInfoConfig } from 'services/cd-ng'
import type { serviceAndEnvData, serviceAndEnvDataStage } from '../types'

export const getInfraAndServiceData = (
  pipeline: { pipeline: PipelineInfoConfig } | undefined,
  formik: any
): serviceAndEnvData => {
  const stageFromPipelineHavingVerify = pipeline?.pipeline?.stages?.find(
    (el: any) => !!el?.stage?.spec?.execution?.steps?.find((step: any) => step?.step?.type === StepType.Verify)
  )
  const currentStageFromForm = formik?.values?.stages?.find(
    (el: any) => el?.stage?.identifier === stageFromPipelineHavingVerify?.stage?.identifier
  )
  let serviceIdentifierData =
    (stageFromPipelineHavingVerify?.stage?.spec as DeploymentStageConfig)?.serviceConfig?.serviceRef || ''
  let envIdentifierData =
    (stageFromPipelineHavingVerify?.stage?.spec as DeploymentStageConfig)?.infrastructure?.environmentRef || ''
  if (serviceIdentifierData === RUNTIME_INPUT_VALUE) {
    serviceIdentifierData = currentStageFromForm?.stage?.spec?.serviceConfig?.serviceRef
  }
  if (envIdentifierData === RUNTIME_INPUT_VALUE) {
    envIdentifierData = currentStageFromForm?.stage?.spec?.infrastructure?.environmentRef
  }
  return { serviceIdentifierData, envIdentifierData }
}

export const getInfraAndServiceFromStage = (
  pipeline: { pipeline: PipelineInfoConfig } | undefined
): serviceAndEnvDataStage => {
  const stageFromPipelineHavingVerify = pipeline?.pipeline?.stages?.find(
    (el: any) => !!el?.stage?.spec?.execution?.steps?.find((step: any) => step?.step?.type === StepType.Verify)
  )
  const serviceIdentifierFromStage =
    (stageFromPipelineHavingVerify?.stage?.spec as DeploymentStageConfig)?.serviceConfig?.serviceRef || ''
  const envIdentifierDataFromStage =
    (stageFromPipelineHavingVerify?.stage?.spec as DeploymentStageConfig)?.infrastructure?.environmentRef || ''

  return { serviceIdentifierFromStage, envIdentifierDataFromStage }
}
