import React from 'react'
import { Text, FormInput, Button, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { FormGroup } from '@blueprintjs/core'
import { useStrings } from 'framework/exports'
import { ShellScriptMonacoField } from '@cd/components/PipelineSteps/ShellScriptStep/ShellScriptMonaco'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import List from '@common/components/List/List'
import Map from '@common/components/Map/Map'
import type { RunTestsStepProps } from './RunTestsStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunTestsStepInputSet: React.FC<RunTestsStepProps> = ({ template, path, readonly }) => {
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const buildToolOptions = [
    { label: 'Gradle', value: 'gradle' },
    { label: 'Bazel', value: 'bazel' },
    { label: 'Maven', value: 'maven' }
  ]
  const languageOptions = [{ label: 'Java', value: 'java' }]

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
      {getMultiTypeFromValue(template?.spec?.args) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.args`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('argsLabel')}
              <Button icon="question" minimal tooltip={getString('runTestsArgsInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.buildTool) === MultiTypeInputType.RUNTIME && (
        <FormInput.Select
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.buildTool`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('buildToolLabel')}
              <Button icon="question" minimal tooltip={getString('buildToolInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          items={buildToolOptions}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.language) === MultiTypeInputType.RUNTIME && (
        <FormInput.Select
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.language`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('languageLabel')}
              <Button icon="question" minimal tooltip={getString('languageInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          items={languageOptions}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.packages) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.packages`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('packagesLabel')}
              <Button icon="question" minimal tooltip={getString('packagesInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.runOnlySelectedTests) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${isEmpty(path) ? '' : `${path}.`}spec.runOnlySelectedTests`}
          label={getString('runOnlySelectedTestsLabel')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.testAnnotations) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.testAnnotations`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('testAnnotationsLabel')}
              <Button icon="question" minimal tooltip={getString('testAnnotationsInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.preCommand) === MultiTypeInputType.RUNTIME && (
        <FormGroup
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('preCommandLabel')}
              <Button icon="question" minimal tooltip={getString('preCommandInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          style={{ marginBottom: 'var(--spacing-small)' }}
        >
          <ShellScriptMonacoField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.preCommand`}
            scriptType="Bash"
            disabled={readonly}
          />
        </FormGroup>
      )}
      {getMultiTypeFromValue(template?.spec?.postCommand) === MultiTypeInputType.RUNTIME && (
        <FormGroup
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('postCommandLabel')}
              <Button icon="question" minimal tooltip={getString('postCommandInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          style={{ marginBottom: 'var(--spacing-small)' }}
        >
          <ShellScriptMonacoField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.postCommand`}
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
