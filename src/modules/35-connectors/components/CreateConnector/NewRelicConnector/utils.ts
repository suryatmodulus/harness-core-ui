import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'

type InitializeNewRelicConnectorArgs = {
  prevStepData?: ConnectorConfigDTO
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
}

export function initializeNewRelicConnector({
  prevStepData,
  accountId,
  projectIdentifier,
  orgIdentifier
}: InitializeNewRelicConnectorArgs): FormData {
  const defaultObj = {
    url: undefined,
    newRelicAccountId: '',
    apiKeyRef: undefined,
    accountId,
    projectIdentifier,
    orgIdentifier
  }

  if (!prevStepData) {
    return defaultObj
  }

  const { spec, ...prevData } = prevStepData
  const initialValues = {
    ...defaultObj,
    ...spec,
    ...prevData
  }

  if (prevData?.url) {
    initialValues.url = prevData.url
  } else if (spec?.url) {
    initialValues.url = { label: spec.url, value: spec.url }
  }

  return initialValues
}
