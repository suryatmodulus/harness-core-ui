import type { ConnectorConfigDTO } from 'services/cd-ng'

export function initializeDynatraceConnectorWithStepData(
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

  return updatedInitialValues
}
