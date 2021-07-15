import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'

import { getMultiTypeFromValue, MultiTypeInputType, FormInput, Label, Color } from '@wings-software/uicore'

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
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { Connector, TerraformPlanProps } from '../../Common/Terraform/TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function ConfigSection(props: TerraformPlanProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, initialValues } = props
  const config = inputSetData?.template?.spec?.configuration
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const connectorValue = initialValues?.spec?.configuration?.configFiles?.store?.spec?.connectorRef as Connector
  const connectorRef = getIdentifierFromValue(connectorValue?.value || '')
  const initialScope = getScopeFromValue(connectorValue?.value || '')

  const {
    data: connector,
    loading,
    refetch
  } = useGetConnector({
    identifier: connectorRef,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
      ...(repoIdentifier && branch ? { repoIdentifier, branch, getDefaultFromOtherRepo: true } : {})
    },
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    if (
      getMultiTypeFromValue(config?.configFiles?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME &&
      getMultiTypeFromValue(connectorValue.value) !== MultiTypeInputType.RUNTIME
    ) {
      refetch()
    }
  }, [initialValues?.spec?.configuration?.configFiles?.store?.spec?.connectorRef])

  let connectorSelected: ConnectorReferenceFieldProps['selected'] = undefined

  if (
    connector?.data?.connector &&
    getMultiTypeFromValue(config?.configFiles?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME &&
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
      {(config?.configFiles?.store?.spec?.connectorRef ||
        config?.workspace ||
        config?.configFiles?.store?.spec?.branch ||
        config?.configFiles?.store?.spec?.commitId ||
        config?.configFiles?.store?.spec?.folderPath) && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {getString('cd.configurationFile')}
        </Label>
      )}
      {getMultiTypeFromValue(config?.workspace) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.Text
            name="spec.configuration.spec.workspace"
            label={getString('pipelineSteps.workspace')}
            disabled={readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(config?.configFiles?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <ConnectorReferenceField
            accountIdentifier={accountId}
            selected={connectorSelected}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            width={445}
            name="spec.configuration.spec.configFiles.store.spec.connectorRef"
            label={getString('connectors.title.gitConnector')}
            placeholder={getString('select')}
            disabled={readonly || loading}
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}

      {getMultiTypeFromValue(config?.configFiles?.store?.spec?.branch) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.Text
            name="spec.configuration.spec.configFiles.store.spec.branch"
            placeholder={getString('pipeline.manifestType.branchPlaceholder')}
            disabled={readonly}
          />
        </div>
      )}

      {getMultiTypeFromValue(config?.configFiles?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.Text
            name="spec.configuration.spec.configFiles.store.spec.commitId"
            placeholder={getString('pipeline.manifestType.commitPlaceholder')}
            disabled={readonly}
          />
        </div>
      )}

      {getMultiTypeFromValue(config?.configFiles?.store?.spec?.folderPath) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.Text
            name="spec.configuration.spec.configFiles.store.spec.folderPath"
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={readonly}
          />
        </div>
      )}
    </>
  )
}
