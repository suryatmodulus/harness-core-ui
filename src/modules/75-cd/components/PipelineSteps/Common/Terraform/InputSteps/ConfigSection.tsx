import React from 'react'
import { useParams } from 'react-router-dom'
import { getMultiTypeFromValue, MultiTypeInputType, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'

import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { Connector, TerraformProps } from '../TerraformInterfaces'

export default function ConfigSection(props: TerraformProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, initialValues, gitScope, path } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const connectorValue = initialValues?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef as Connector
  const connectorRef = getIdentifierFromValue(connectorValue?.value || '')
  const initialScope = getScopeFromValue(connectorValue?.value || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorRef,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    if (
      getMultiTypeFromValue(
        inputSetData?.template?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
      ) === MultiTypeInputType.RUNTIME &&
      getMultiTypeFromValue(connectorValue?.value) !== MultiTypeInputType.RUNTIME
    ) {
      refetch()
    }
  }, [initialValues?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef])

  let connectorSelected: ConnectorReferenceFieldProps['selected'] = undefined
  if (
    connector?.data?.connector &&
    getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef) ===
      MultiTypeInputType.RUNTIME &&
    getMultiTypeFromValue(connectorValue.value) === MultiTypeInputType.FIXED
  ) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    connectorSelected = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.workspace) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.spec.configuration.spec.workspace`}
          label={getString('pipelineSteps.workspace')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(
        inputSetData?.template?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
      ) === MultiTypeInputType.RUNTIME && (
        <ConnectorReferenceField
          accountIdentifier={accountId}
          selected={connectorSelected}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={400}
          type={['Git', 'Github', 'Gitlab', 'Bitbucket']}
          name={`${path}.configuration.spec.configFiles.store.spec.connectorRef`}
          label={getString('connectors.title.gitConnector')}
          placeholder={getString('select')}
          disabled={readonly || loading}
          gitScope={gitScope}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.configFiles?.store?.spec?.branch) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.configuration.spec.configFiles.store.spec.branch`}
          placeholder={getString('pipeline.manifestType.branchPlaceholder')}
          disabled={readonly}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.configFiles?.store?.spec?.commitId) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.configuration.spec.configFiles.store.spec.commitId`}
          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
          disabled={readonly}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.configFiles?.store?.spec?.commitId) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.configuration.spec.configFiles.store.spec.commitId`}
          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
          disabled={readonly}
        />
      )}

      {getMultiTypeFromValue(
        inputSetData?.template?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath
      ) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.configuration.spec.configFiles.store.spec.folderPath`}
          placeholder={getString('pipeline.manifestType.pathPlaceholder')}
          disabled={readonly}
        />
      )}
    </>
  )
}
