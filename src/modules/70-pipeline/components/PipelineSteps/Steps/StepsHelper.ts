import { Scope } from '@common/interfaces/SecretsInterface'
import type { ConnectorResponse } from 'services/cd-ng'

export const getConnectorValue = (connector?: ConnectorResponse): string => {
  const connectorIdentifier = connector?.connector?.identifier
  const orgIdentifier = connector?.connector?.orgIdentifier
  const projectIdentifier = connector?.connector?.projectIdentifier
  const accountIdentifierValue = `${Scope.ACCOUNT}.${connectorIdentifier}`
  const orgIdentifierValue = `${Scope.ORG}.${connectorIdentifier}`

  return (
    `${
      orgIdentifier && projectIdentifier
        ? connectorIdentifier
        : orgIdentifier
        ? orgIdentifierValue
        : accountIdentifierValue
    }` || ''
  )
}
export const getConnectorName = (connector?: ConnectorResponse): string => {
  const connectorType = connector?.connector?.type
  const connectorName = connector?.connector?.name
  const orgIdentifier = connector?.connector?.orgIdentifier
  const projectIdentifier = connector?.connector?.projectIdentifier
  const connectorNameBasedOnOrgNProjectId = `${connectorType}: ${connectorName}`
  const connectorNameBasedOnOrg = `${connectorType}[Org]: ${connectorName}`
  const connectorNameBasedOnAccount = `${connectorType}[Account]: ${connectorName}`
  return (
    `${
      orgIdentifier && projectIdentifier
        ? connectorNameBasedOnOrgNProjectId
        : orgIdentifier
        ? connectorNameBasedOnOrg
        : connectorNameBasedOnAccount
    }` || ''
  )
}
