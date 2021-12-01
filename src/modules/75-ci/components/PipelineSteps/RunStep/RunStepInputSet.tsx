import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color, Container } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { Separator } from '@common/components'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { MultiTypeMapInputSet } from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { Connectors } from '@connectors/constants'
import type { RunStepProps } from './RunStep'
import { CIStep } from '../CIStep/CIStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunStepInputSet: React.FC<RunStepProps> = ({ template, path, readonly, stepViewType }) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin} style={{ width: '50%' }}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && { description: {} }),
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
              tooltipId: 'image',
              multiTextInputProps: {
                placeholder: getString('imagePlaceholder'),
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
      {getMultiTypeFromValue(template?.spec?.command) === MultiTypeInputType.RUNTIME && (
        <div className={cx(css.fieldsGroup, css.withoutSpacing, css.topPadding3, css.bottomPadding3)}>
          <MultiTypeFieldSelector
            name={`${isEmpty(path) ? '' : `${path}.`}spec.command`}
            label={
              <Text
                color={Color.GREY_800}
                font={{ size: 'normal', weight: 'bold' }}
                className={css.inpLabel}
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{ dataTooltipId: 'runCommand' }}
              >
                {getString('commandLabel')}
              </Text>
            }
            defaultValueToReset=""
            skipRenderValueInExpressionLabel
            allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
            expressionRender={() => {
              return (
                <ShellScriptMonacoField
                  title={getString('commandLabel')}
                  name={`${isEmpty(path) ? '' : `${path}.`}spec.command`}
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
              title={getString('commandLabel')}
              name={`${isEmpty(path) ? '' : `${path}.`}spec.command`}
              scriptType="Bash"
              disabled={readonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.privileged) === MultiTypeInputType.RUNTIME && (
        <div className={cx(css.formGroup, css.sm, css.topMargin4)}>
          <FormMultiTypeCheckboxField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.privileged`}
            label={getString('ci.privileged')}
            disabled={readonly}
            multiTypeTextbox={{
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }}
            tooltipProps={{ dataTooltipId: 'privileged' }}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.reports?.spec?.paths as string) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, css.lg)}>
          <MultiTypeListInputSet
            name={`${isEmpty(path) ? '' : `${path}.`}spec.reports.spec.paths`}
            multiTextInputProps={{
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
              expressions
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text
                  style={{ display: 'flex', alignItems: 'center' }}
                  className={css.inpLabel}
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
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
      <Separator topSeparation={24} />
      {getMultiTypeFromValue(template?.spec?.envVariables as string) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, css.lg)}>
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
                  className={css.inpLabel}
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
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
        <Container className={cx(css.formGroup, css.lg)}>
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
                  className={css.inpLabel}
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
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
