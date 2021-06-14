import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'

type InitializeSplunkConnectorArgs = {
  prevStepData?: ConnectorConfigDTO
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
}

export function initializeSplunkConnector({
  prevStepData,
  projectIdentifier,
  accountId,
  orgIdentifier
}: InitializeSplunkConnectorArgs): FormData {
  const defaultObj = {
    url: '',
    username: '',
    passwordRef: undefined,
    accountId: accountId,
    projectIdentifier,
    orgIdentifier
  }

  if (!prevStepData) {
    return defaultObj
  }

  const { spec, ...prevData } = prevStepData
  return {
    ...defaultObj,
    url: prevData?.url || spec?.splunkUrl || '',
    username: prevData?.username || spec?.username,
    passwordRef: prevData?.passwordRef || spec?.passwordRef
  }
}
