import React from 'react'
import { Text, Button, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import MultiTypeMapInputSet from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { RunTestsStepProps } from './RunTestsStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunTestsStepInputSet: React.FC<RunTestsStepProps> = ({ template, path, readonly }) => {
  const { getString } = useStrings()

  const {
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier: repo = '',
    branch
  } = useParams<
    {
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    } & GitQueryParams
  >()

  const { expressions } = useVariablesExpression()

  const buildToolOptions = [
    { label: 'Bazel', value: 'bazel' },
    { label: 'Maven', value: 'maven' }
  ]
  const languageOptions = [{ label: 'Java', value: 'java' }]

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      {getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeTextAreaField
          name={`${isEmpty(path) ? '' : `${path}.`}description`}
          label={getString('description')}
          multiTypeTextArea={{
            expressions,
            disabled: readonly,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
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
          setRefValue
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={560}
          gitScope={{ branch, repo, getDefaultFromOtherRepo: true }}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.connectorRef`}
          placeholder={getString('select')}
          multiTypeProps={{
            expressions,
            disabled: readonly,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.image`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('imageLabel')}
              <Button icon="question" minimal tooltip={getString('imageInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          multiTextInputProps={{
            placeholder: getString('imagePlaceholder'),
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.args) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.args`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('argsLabel')}
              <Button icon="question" minimal tooltip={getString('runTestsArgsInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          multiTextInputProps={{
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.buildTool) === MultiTypeInputType.RUNTIME && (
        <MultiTypeSelectField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.buildTool`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('buildToolLabel')}
              <Button icon="question" minimal tooltip={getString('buildToolInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          multiTypeInputProps={{
            selectItems: buildToolOptions,
            multiTypeInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.language) === MultiTypeInputType.RUNTIME && (
        <MultiTypeSelectField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.language`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('languageLabel')}
              <Button icon="question" minimal tooltip={getString('languageInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          multiTypeInputProps={{
            selectItems: languageOptions,
            multiTypeInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.packages) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.packages`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('packagesLabel')}
              <Button icon="question" minimal tooltip={getString('packagesInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          multiTextInputProps={{
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.runOnlySelectedTests) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeCheckboxField
          name={`${isEmpty(path) ? '' : `${path}.`}spec.runOnlySelectedTests`}
          label={getString('runOnlySelectedTestsLabel')}
          multiTypeTextbox={{
            expressions,
            disabled: readonly,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
          setToFalseWhenEmpty={true}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.testAnnotations) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.testAnnotations`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('testAnnotationsLabel')}
              <Button icon="question" minimal tooltip={getString('testAnnotationsInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          multiTextInputProps={{
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.preCommand) === MultiTypeInputType.RUNTIME && (
        <MultiTypeFieldSelector
          name={`${isEmpty(path) ? '' : `${path}.`}spec.preCommand`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('preCommandLabel')}
              <Button icon="question" minimal tooltip={getString('preCommandInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          defaultValueToReset=""
          allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
          expressionRender={() => {
            return (
              <ShellScriptMonacoField
                title={getString('preCommandLabel')}
                name={`${isEmpty(path) ? '' : `${path}.`}spec.preCommand`}
                scriptType="Bash"
                expressions={expressions}
                disabled={readonly}
              />
            )
          }}
          style={{ flexGrow: 1, marginBottom: 0 }}
          disableTypeSelection={readonly}
        >
          <ShellScriptMonacoField
            title={getString('preCommandLabel')}
            name={`${isEmpty(path) ? '' : `${path}.`}spec.preCommand`}
            scriptType="Bash"
            expressions={expressions}
            disabled={readonly}
          />
        </MultiTypeFieldSelector>
      )}
      {getMultiTypeFromValue(template?.spec?.postCommand) === MultiTypeInputType.RUNTIME && (
        <MultiTypeFieldSelector
          name={`${isEmpty(path) ? '' : `${path}.`}spec.postCommand`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('postCommandLabel')}
              <Button icon="question" minimal tooltip={getString('postCommandInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          defaultValueToReset=""
          allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
          expressionRender={() => {
            return (
              <ShellScriptMonacoField
                title={getString('postCommandLabel')}
                name={`${isEmpty(path) ? '' : `${path}.`}spec.postCommand`}
                scriptType="Bash"
                expressions={expressions}
                disabled={readonly}
              />
            )
          }}
          style={{ flexGrow: 1, marginBottom: 0 }}
          disableTypeSelection={readonly}
        >
          <ShellScriptMonacoField
            title={getString('postCommandLabel')}
            name={`${isEmpty(path) ? '' : `${path}.`}spec.postCommand`}
            scriptType="Bash"
            expressions={expressions}
            disabled={readonly}
          />
        </MultiTypeFieldSelector>
      )}
      {getMultiTypeFromValue(template?.spec?.reports?.spec?.paths as string) === MultiTypeInputType.RUNTIME && (
        <MultiTypeListInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.reports.spec.paths`}
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                {getString('pipelineSteps.reportPathsLabel')}
                <Button
                  icon="question"
                  minimal
                  tooltip={getString('pipelineSteps.reportPathsInfo')}
                  iconProps={{ size: 14 }}
                />
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.envVariables as string) === MultiTypeInputType.RUNTIME && (
        <MultiTypeMapInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.envVariables`}
          valueMultiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                {getString('environmentVariables')}
                <Button
                  icon="question"
                  minimal
                  tooltip={getString('environmentVariablesInfo')}
                  iconProps={{ size: 14 }}
                />
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.outputVariables as string) === MultiTypeInputType.RUNTIME && (
        <MultiTypeListInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.outputVariables`}
          withObjectStructure
          keyName="name"
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                {getString('pipelineSteps.outputVariablesLabel')}
                <Button
                  icon="question"
                  minimal
                  tooltip={getString('pipelineSteps.outputVariablesInfo')}
                  iconProps={{ size: 14 }}
                />
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
