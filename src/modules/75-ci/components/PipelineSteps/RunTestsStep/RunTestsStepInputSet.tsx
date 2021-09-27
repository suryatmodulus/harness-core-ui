import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import MultiTypeMapInputSet from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { FormMultiTypeCheckboxField } from '@common/components'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { RunTestsStepProps } from './RunTestsStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunTestsStepInputSet: React.FC<RunTestsStepProps> = ({ template, path, readonly, stepViewType }) => {
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

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin} style={{ width: '50%' }}>
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
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'connector' }}>
              {getString('pipelineSteps.connectorLabel')}
            </Text>
          }
          type={['Gcp', 'Aws', 'DockerRegistry']}
          setRefValue
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={stepViewType === StepViewType.DeploymentForm ? 391 : 455}
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
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{
                dataTooltipId: 'image'
              }}
            >
              {getString('imageLabel')}
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
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'runTestsArgs' }}>
              {getString('argsLabel')}
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
      {getMultiTypeFromValue(template?.spec?.packages) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.packages`}
          label={
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{ dataTooltipId: 'runTestsPackages' }}
            >
              {getString('packagesLabel')}
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
        <div className={cx(css.formGroup, css.sm)}>
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
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.testAnnotations) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.testAnnotations`}
          label={
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{ dataTooltipId: 'runTestsTestAnnotations' }}
            >
              {getString('testAnnotationsLabel')}
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
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{ dataTooltipId: 'runTestsPreCommand' }}
            >
              {getString('preCommandLabel')}
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
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{ dataTooltipId: 'runTestsPostCommand' }}
            >
              {getString('postCommandLabel')}
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
              <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'reportPaths' }}>
                {getString('pipelineSteps.reportPathsLabel')}
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
              <Text
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{ dataTooltipId: 'environmentVariables' }}
              >
                {getString('environmentVariables')}
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
              <Text
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{ dataTooltipId: 'outputVariables' }}
              >
                {getString('pipelineSteps.outputVariablesLabel')}
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
