import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { ContinousVerificationData, spec } from '@cv/components/PipelineSteps/ContinousVerification/types'
import type { HealthSource, MonitoredServiceDTO } from 'services/cv'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { PipelineInfoConfig } from 'services/cd-ng'

export const getNewSpecs = (
  monitoredServiceData: MonitoredServiceDTO | undefined,
  formValues: ContinousVerificationData
): spec => {
  const healthSources =
    monitoredServiceData?.sources?.healthSources?.map(el => {
      return { identifier: (el as HealthSource)?.identifier }
    }) || []

  return { ...formValues.spec, monitoredServiceRef: monitoredServiceData?.identifier, healthSources }
}

export const isAnExpression = (value: string): boolean => {
  return value.startsWith('<+') && value !== RUNTIME_INPUT_VALUE
}

export const getServiceIdFromStage = (stage: StageElementWrapper<DeploymentStageElementConfig>): string => {
  return stage?.stage?.spec?.serviceConfig?.service?.identifier || stage?.stage?.spec?.serviceConfig?.serviceRef || ''
}

export function getServiceIdentifier(
  selectedStage: StageElementWrapper<DeploymentStageElementConfig> | undefined,
  pipeline: PipelineInfoConfig
): string {
  let serviceId = ''
  if (selectedStage?.stage?.spec?.serviceConfig?.useFromStage) {
    const stageIdToDeriveServiceFrom = selectedStage?.stage?.spec?.serviceConfig?.useFromStage?.stage
    const stageToDeriveServiceFrom = pipeline?.stages?.find(el => el?.stage?.identifier === stageIdToDeriveServiceFrom)
    serviceId = getServiceIdFromStage(stageToDeriveServiceFrom as StageElementWrapper<DeploymentStageElementConfig>)
  } else {
    serviceId = getServiceIdFromStage(selectedStage as StageElementWrapper<DeploymentStageElementConfig>)
  }
  return serviceId
}
