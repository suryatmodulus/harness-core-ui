import React from 'react'
import cx from 'classnames'

import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'

import { getMultiTypeFromValue, MultiTypeInputType, FormInput, Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import List from '@common/components/List/List'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { TerraformPlanProps } from '../../Common/Terraform/TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TFRemoteSection(
  props: TerraformPlanProps & {
    remoteVar: any
    index: number
  }
): React.ReactElement {
  const { remoteVar, index } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { readonly, initialValues, path } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  return (
    <>
      <Container flex width={120}>
        <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
        {remoteVar.varFile?.identifier}
      </Container>

      {getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          accountIdentifier={accountId}
          selected={get(
            initialValues,
            `${path}.spec.configuration.varFiles[${index}].varFile.spec.store.spec.connectorRef`,
            ''
          )}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={400}
          type={[remoteVar?.varFile?.spec?.store?.type]}
          name={`${path}.spec.configuration.varFiles[${index}].varFile.spec.store.spec.connectorRef`}
          label={getString('connector')}
          placeholder={getString('select')}
          disabled={readonly}
          setRefValue
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
      )}

      {getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.branch) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.configuration.varFiles[${index}].varFile.spec.store.spec.branch`}
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.configuration.varFiles[${index}].varFile.spec.store.spec.commitId`}
            label={getString('pipeline.manifestType.commitId')}
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.paths) === MultiTypeInputType.RUNTIME && (
        <List
          label={getString('filePaths')}
          name={`${path}.spec.configuration.varFiles[${index}].varFile.spec.store.spec.paths`}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          isNameOfArrayType
        />
      )}
    </>
  )
}
