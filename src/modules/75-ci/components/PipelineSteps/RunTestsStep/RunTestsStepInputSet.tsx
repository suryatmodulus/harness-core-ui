import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color, Container } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import MultiTypeMapInputSet from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { Connectors } from '@connectors/constants'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { RunTestsStepProps } from './RunTestsStep'
import { CIStep } from '../CIStep/CIStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunTestsStepInputSet: React.FC<RunTestsStepProps> = ({ template, path, readonly, stepViewType }) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin} style={{ width: '50%' }}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && {
            description: {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'connector' }}
                >
                  {getString('pipelineSteps.connectorLabel')}
                </Text>
              ),
              type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER],
              multiTypeProps: {
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
              }
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME && {
            'spec.image': {
              tooltipId: 'pluginImageInfo',
              multiTextInputProps: {
                placeholder: getString('pluginImagePlaceholder'),
                disabled: readonly,
                multiTextInputProps: {
                  expressions,
                  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                }
              }
            }
          })
        }}
        isInputSetView={true}
      />
      {getMultiTypeFromValue(template?.spec?.args) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            className={css.removeBpLabelMargin}
            name={`${isEmpty(path) ? '' : `${path}.`}spec.args`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'runTestsArgs' }}
              >
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
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.packages) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            className={css.removeBpLabelMargin}
            name={`${isEmpty(path) ? '' : `${path}.`}spec.packages`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
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
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.runOnlySelectedTests) === MultiTypeInputType.RUNTIME && (
        <Container
          className={cx(
            css.formGroup,
            { [css.sm]: stepViewType !== StepViewType.InputSet },
            { [css.lg]: stepViewType === StepViewType.DeploymentForm },
            css.bottomMargin5
          )}
        >
          <FormMultiTypeCheckboxField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.runOnlySelectedTests`}
            label={getString('runOnlySelectedTestsLabel')}
            multiTypeTextbox={{
              expressions,
              disabled: readonly,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }}
            setToFalseWhenEmpty={true}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.testAnnotations) === MultiTypeInputType.RUNTIME && (
        <Container
          className={cx(
            css.formGroup,
            { [css.sm]: stepViewType !== StepViewType.InputSet },
            { [css.lg]: stepViewType === StepViewType.DeploymentForm },
            css.bottomMargin5
          )}
        >
          <MultiTypeTextField
            className={css.removeBpLabelMargin}
            name={`${isEmpty(path) ? '' : `${path}.`}spec.testAnnotations`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
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
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.preCommand) === MultiTypeInputType.RUNTIME && (
        <Container className={css.bottomMargin5}>
          <div className={cx(css.fieldsGroup, css.withoutSpacing)} style={{ marginBottom: 'var(--spacing-small)' }}>
            <MultiTypeFieldSelector
              name={`${isEmpty(path) ? '' : `${path}.`}spec.preCommand`}
              label={
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
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
          </div>
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.postCommand) === MultiTypeInputType.RUNTIME && (
        <Container className={css.bottomMargin5}>
          <div className={cx(css.fieldsGroup, css.withoutSpacing)} style={{ marginBottom: 'var(--spacing-small)' }}>
            <MultiTypeFieldSelector
              name={`${isEmpty(path) ? '' : `${path}.`}spec.postCommand`}
              label={
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
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
          </div>
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.reports?.spec?.paths as string) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeListInputSet
            name={`${isEmpty(path) ? '' : `${path}.`}spec.reports.spec.paths`}
            multiTextInputProps={{
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
              expressions
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'reportPaths' }}
                >
                  {getString('pipelineSteps.reportPathsLabel')}
                </Text>
              ),
              allowedTypes: [MultiTypeInputType.FIXED]
            }}
            placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
            disabled={readonly}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.envVariables as string) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          <MultiTypeMapInputSet
            name={`${isEmpty(path) ? '' : `${path}.`}spec.envVariables`}
            valueMultiTextInputProps={{
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
              expressions
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'environmentVariables' }}
                >
                  {getString('environmentVariables')}
                </Text>
              ),
              allowedTypes: [MultiTypeInputType.FIXED]
            }}
            disabled={readonly}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.outputVariables as string) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
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
                  className={css.inpLabel}
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
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
        </Container>
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
