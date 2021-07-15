import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Color, Text, Container } from '@wings-software/uicore'
import { TokenDTO, useListAggregatedApiKeys } from 'services/cd-ng'
import type { ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useApiKeyModal } from '@rbac/modals/ApiKeyModal/useApiKeyModal'
import { useTokenModal } from '@rbac/modals/TokenModal/useTokenModal'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import ApiKeyCard from '@rbac/components/ApiKeyList/views/ApiKeyCard'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'

interface ApiKeyListProps {
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
}

const ApiKeyList: React.FC<ApiKeyListProps> = ({ apiKeyType = 'SERVICE_ACCOUNT', parentIdentifier }) => {
  const { accountId, projectIdentifier, orgIdentifier, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps
  >()
  const { getString } = useStrings()
  const [refetchTokens, setRefetchTokens] = useState<boolean>(false)
  const { data, refetch, error, loading } = useListAggregatedApiKeys({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      apiKeyType,
      parentIdentifier: parentIdentifier || serviceAccountIdentifier
    }
  })

  const { openApiKeyModal } = useApiKeyModal({
    onSuccess: refetch,
    parentIdentifier: parentIdentifier || serviceAccountIdentifier,
    apiKeyType
  })

  const onRefetchComplete = (): void => {
    setRefetchTokens(false)
  }

  const { openTokenModal } = useTokenModal({
    onSuccess: () => {
      refetch()
      setRefetchTokens(true)
    },
    parentIdentifier: parentIdentifier || serviceAccountIdentifier,
    apiKeyType
  })

  return (
    <Container padding={{ bottom: 'xlarge' }}>
      <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
        {apiKeyType === 'SERVICE_ACCOUNT' ? getString('common.apiKeys') : getString('rbac.myApiKeys')}
      </Text>
      <Container padding={{ top: 'medium', bottom: 'medium' }}>
        {loading && <PageSpinner />}
        {error && <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />}
        {data?.data?.content?.map(apiKey => (
          <ApiKeyCard
            key={apiKey.apiKey.identifier}
            data={apiKey}
            refetchApiKeys={refetch}
            openTokenModal={openTokenModal}
            refetchTokens={refetchTokens}
            onRefetchComplete={onRefetchComplete}
          />
        ))}
      </Container>
      <RbacButton
        text={getString('plusNumber', { number: getString('common.apikey') })}
        minimal
        onClick={() => openApiKeyModal()}
        data-testid="createNewApiKey"
        permission={{
          permission: PermissionIdentifier.MANAGE_SERVICEACCOUNT,
          resource: {
            resourceType: ResourceType.SERVICEACCOUNT,
            resourceIdentifier: serviceAccountIdentifier
          },
          options: {
            skipCondition: () => apiKeyType === 'USER'
          }
        }}
      />
    </Container>
  )
}

export default ApiKeyList
