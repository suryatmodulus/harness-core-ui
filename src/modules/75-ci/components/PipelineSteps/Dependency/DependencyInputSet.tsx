import React from 'react'
import { Text, FormInput, Button, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import Map from '@common/components/Map/Map'
import List from '@common/components/List/List'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import type { DependencyProps } from './Dependency'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const DependencyInputSet: React.FC<DependencyProps> = ({ template, path, readonly }) => {
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      {getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && (
        <FormInput.TextArea
          name={`${isEmpty(path) ? '' : `${path}.`}description`}
          label={getString('description')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormConnectorReferenceField
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.connectorLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.dependencyConnectorInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          type={['Gcp', 'Aws', 'DockerRegistry']}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={560}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.connectorRef`}
          placeholder={getString('select')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.image`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('imageLabel')}
              <Button icon="question" minimal tooltip={getString('imageInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.envVariables as string) === MultiTypeInputType.RUNTIME && (
        <Map
          name={`${isEmpty(path) ? '' : `${path}.`}spec.envVariables`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('environmentVariables')}
              <Button
                icon="question"
                minimal
                tooltip={getString('environmentVariablesInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.entrypoint as string) === MultiTypeInputType.RUNTIME && (
        <List
          name={`${isEmpty(path) ? '' : `${path}.`}spec.entrypoint`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('entryPointLabel')}
              <Button icon="question" minimal tooltip={getString('entryPointInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.args as string) === MultiTypeInputType.RUNTIME && (
        <List
          name={`${isEmpty(path) ? '' : `${path}.`}spec.args`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('argsLabel')}
              <Button icon="question" minimal tooltip={getString('argsInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          disabled={readonly}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} withoutTimeout />
    </FormikForm>
  )
}
