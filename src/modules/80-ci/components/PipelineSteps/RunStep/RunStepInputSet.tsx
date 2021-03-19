import React from 'react'
import { Text, FormInput, Button, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { FormGroup } from '@blueprintjs/core'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import Map from '@common/components/Map/Map'
import { ShellScriptMonacoField } from '@cd/components/PipelineSteps/ShellScriptStep/ShellScriptMonaco'
import List from '@common/components/List/List'
// import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import type { RunStepProps } from './RunStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunStepInputSet: React.FC<RunStepProps> = ({ template, path, readonly }) => {
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
                tooltip={getString('pipelineSteps.connectorInfo')}
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
      {getMultiTypeFromValue(template?.spec?.command) === MultiTypeInputType.RUNTIME && (
        <FormGroup
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('commandLabel')}
              <Button icon="question" minimal tooltip={getString('commandInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          style={{ marginBottom: 'var(--spacing-small)' }}
        >
          <ShellScriptMonacoField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.command`}
            scriptType="Bash"
            disabled={readonly}
          />
        </FormGroup>
      )}
      {getMultiTypeFromValue(template?.spec?.reports?.spec?.paths as string) === MultiTypeInputType.RUNTIME && (
        <List
          name={`${isEmpty(path) ? '' : `${path}.`}spec.reports.spec.paths`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.reportPathsLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.reportPathsInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
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
      {getMultiTypeFromValue(template?.spec?.outputVariables as string) === MultiTypeInputType.RUNTIME && (
        <List
          name={`${isEmpty(path) ? '' : `${path}.`}spec.outputVariables`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.outputVariablesLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.outputVariablesInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
