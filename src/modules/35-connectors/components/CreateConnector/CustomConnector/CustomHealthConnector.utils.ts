import type { ConnectorConfigDTO } from 'services/cd-ng'

export function initializePrometheusConnectorWithStepData(
  prevStepData?: ConnectorConfigDTO | null
): ConnectorConfigDTO | undefined {
  if (!prevStepData) {
    return
  }

  const { spec, ...prevData } = prevStepData
  const updatedInitialValues = {
    ...spec,
    ...prevData
  }

  if (prevData?.url) {
    updatedInitialValues.url = prevData.url
  } else if (spec?.url) {
    updatedInitialValues.url = spec.url
  }

  return updatedInitialValues
}
