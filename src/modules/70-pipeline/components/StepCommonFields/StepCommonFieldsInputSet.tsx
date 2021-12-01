import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, Container, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { connect } from 'formik'
import { useStrings } from 'framework/strings'
import { Separator } from '@common/components'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { GetShellOptions, GetImagePullPolicyOptions } from '@pipeline/components/StepCommonFields/StepCommonFields'
import type { InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import css from '../PipelineSteps/Steps/Steps.module.scss'

interface StepCommonFieldsInputSetProps<T> extends Omit<InputSetData<T>, 'path' | 'template'> {
  path?: string
  // @TODO: set up proper typing
  // eslint-disable-next-line
  template: any
  withoutTimeout?: boolean
  enableFields?: string[]
}

function StepCommonFieldsInputSet<T>(props: StepCommonFieldsInputSetProps<T>): JSX.Element | null {
  const { path, template, readonly, withoutTimeout, enableFields = [] } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const isRunAsUserRuntime = getMultiTypeFromValue(template?.spec?.runAsUser) === MultiTypeInputType.RUNTIME
  const isLimitMemoryRuntime =
    getMultiTypeFromValue(template?.spec?.resources?.limits?.memory) === MultiTypeInputType.RUNTIME
  const isLimitCPURuntime = getMultiTypeFromValue(template?.spec?.resources?.limits?.cpu) === MultiTypeInputType.RUNTIME
  const isTimeoutRuntime = getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME

  // If neither value is runtime then return null
  if (!isLimitMemoryRuntime && !isLimitCPURuntime && !isTimeoutRuntime && !isRunAsUserRuntime) {
    return null
  }

  return (
    <>
      {/* Currently not implemented due to no support for enum value fields */}
      {/* When ready, pass enableFields when <x>StepInputSet has field as runtime input */}
      {enableFields.includes('spec.imagePullPolicy') && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeSelectField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.imagePullPolicy`}
            label={
              <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                {getString('pipelineSteps.pullLabel')}
              </Text>
            }
            multiTypeInputProps={{
              selectItems: GetImagePullPolicyOptions(),
              placeholder: getString('select'),
              multiTypeInputProps: {
                expressions,
                selectProps: { addClearBtn: true, items: GetImagePullPolicyOptions() },
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
              },
              disabled: readonly
            }}
            disabled={readonly}
            configureOptionsProps={{ variableName: 'spec.imagePullPolicy' }}
          />
        </Container>
      )}
      {/* Currently not implemented due to no support for enum value fields */}
      {enableFields.includes('spec.shell') && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeSelectField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.shell`}
            label={
              <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                {getString('common.shell')}
              </Text>
            }
            multiTypeInputProps={{
              selectItems: GetImagePullPolicyOptions(),
              placeholder: getString('select'),
              multiTypeInputProps: {
                expressions,
                selectProps: { addClearBtn: true, items: GetShellOptions() },
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
              },
              disabled: readonly
            }}
            disabled={readonly}
            configureOptionsProps={{ variableName: 'spec.shell' }}
          />
        </Container>
      )}
      {isRunAsUserRuntime && (
        <Container className={cx(css.formGroup, css.lg, css.topSpacingLarge)}>
          <MultiTypeTextField
            label={
              <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                {getString('pipeline.stepCommonFields.runAsUser')}
              </Text>
            }
            name={`${isEmpty(path) ? '' : `${path}.`}spec.runAsUser`}
            multiTextInputProps={{
              multiTextInputProps: {
                expressions,
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
              },
              disabled: readonly,
              placeholder: '1000'
            }}
          />
        </Container>
      )}
      <Separator />
      {(isLimitMemoryRuntime || isLimitCPURuntime) && (
        <>
          <Container className={css.bottomMargin5}>
            <Text
              className={css.inpLabel}
              color={Color.GREY_600}
              font={{ size: 'small', weight: 'semi-bold' }}
              tooltipProps={{ dataTooltipId: 'setContainerResources' }}
            >
              {getString('pipelineSteps.setContainerResources')}
            </Text>
            <div
              className={cx(
                css.formGroup,
                {
                  [css.kvpairLg]: isLimitMemoryRuntime && isLimitCPURuntime
                },
                {
                  [css.lg]: isLimitMemoryRuntime || isLimitCPURuntime
                }
              )}
              style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
            >
              {isLimitMemoryRuntime && (
                <MultiTypeTextField
                  name={`${isEmpty(path) ? '' : `${path}.`}spec.resources.limits.memory`}
                  label={
                    <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                      {getString('pipelineSteps.limitMemoryLabel')}
                    </Text>
                  }
                  multiTextInputProps={{
                    disabled: readonly,
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                    }
                  }}
                />
              )}
              {isLimitCPURuntime && (
                <MultiTypeTextField
                  name={`${isEmpty(path) ? '' : `${path}.`}spec.resources.limits.cpu`}
                  label={
                    <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                      {getString('pipelineSteps.limitCPULabel')}
                    </Text>
                  }
                  multiTextInputProps={{
                    disabled: readonly,
                    multiTextInputProps: {
                      expressions,
                      allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                    }
                  }}
                />
              )}
            </div>
          </Container>
        </>
      )}
      {!withoutTimeout && isTimeoutRuntime && (
        <Container className={cx(css.formGroup, css.sm, css.bottomMargin5, css.topMargin5)}>
          <FormMultiTypeDurationField
            className={css.removeBpLabelMargin}
            label={
              <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                {getString('pipelineSteps.timeoutLabel')}
              </Text>
            }
            name={`${isEmpty(path) ? '' : `${path}.`}timeout`}
            placeholder={getString('pipelineSteps.timeoutPlaceholder')}
            multiTypeDurationProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }}
            disabled={readonly}
          />
        </Container>
      )}
    </>
  )
}

export default connect(StepCommonFieldsInputSet)
