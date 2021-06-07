import React from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, FormInput, Color, Label } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import { Connectors } from '@connectors/constants'

import type { TerraformPlanProps } from '../../Common/Terraform/TerraformInterfaces'

export default function ConfigSection(props: TerraformPlanProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, initialValues, path } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  return (
    <>
      <Label style={{ color: Color.GREY_900 }}>{getString('cd.configurationFile')}</Label>
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.workspace) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.configuration.spec.workspace`}
          label={getString('pipelineSteps.workspace')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.configFiles?.store?.spec?.connectorRef) ===
        MultiTypeInputType.RUNTIME && (
        <FormConnectorReferenceField
          accountIdentifier={accountId}
          selected={get(initialValues, 'spec.configuration.configFiles.store.spec.connectorRef', '')}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={400}
          type={[Connectors.GIT, Connectors.Github, Connectors.Gitlab, Connectors.Bitbucket]}
          name={`${path}.spec.configuration.configFiles.store.spec.connectorRef`}
          label={getString('connector')}
          placeholder={getString('select')}
          disabled={readonly}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.configFiles?.store?.spec?.branch) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.spec.configuration.configFiles.store.spec.branch`}
          placeholder={getString('pipeline.manifestType.branchPlaceholder')}
          disabled={readonly}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.configFiles?.store?.spec?.commitId) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.spec.configuration.spec.configFiles.store.spec.commitId`}
          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
          disabled={readonly}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.configFiles?.store?.spec?.commitId) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.spec.configuration.spec.configFiles.store.spec.commitId`}
          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
          disabled={readonly}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.configFiles?.store?.spec?.folderPath) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.spec.configuration.spec.configFiles.store.spec.folderPath`}
          placeholder={getString('pipeline.manifestType.pathPlaceholder')}
          disabled={readonly}
        />
      )}
    </>
  )
}
