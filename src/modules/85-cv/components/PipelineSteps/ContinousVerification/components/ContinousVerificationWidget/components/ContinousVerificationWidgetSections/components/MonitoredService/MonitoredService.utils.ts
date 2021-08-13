import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { ContinousVerificationData, spec } from '@cv/components/PipelineSteps/ContinousVerification/types'
import type { HealthSource, MonitoredServiceDTO } from 'services/cv'

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
