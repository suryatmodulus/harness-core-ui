import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'

type InitializeDynatraceConnectorArgs = {
  prevStepData?: ConnectorConfigDTO
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
}

export function initializeDynatraceConnectorWithStepData({
  prevStepData,
  accountId,
  projectIdentifier,
  orgIdentifier
}: InitializeDynatraceConnectorArgs): FormData {
  const defaultObj = {
    url: undefined,
    accountId,
    projectIdentifier,
    orgIdentifier
  }

  if (!prevStepData) {
    return defaultObj
  }

  const { spec, ...prevData } = prevStepData
  const updatedInitialValues = {
    ...defaultObj,
    ...spec,
    ...prevData
  }

  return updatedInitialValues
}
