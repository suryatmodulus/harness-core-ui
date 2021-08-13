import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { connect } from 'formik'
import { useStrings } from 'framework/strings'
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
        <MultiTypeSelectField
          name={`${isEmpty(path) ? '' : `${path}.`}spec.imagePullPolicy`}
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.pullLabel')}</Text>}
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
          style={{ margin: 'var(--spacing-medium) 0' }}
        />
      )}
      {/* Currently not implemented due to no support for enum value fields */}
      {enableFields.includes('spec.shell') && (
        <MultiTypeSelectField
          name={`${isEmpty(path) ? '' : `${path}.`}spec.shell`}
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('common.shell')}</Text>}
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
          style={{ marginBottom: 'var(--spacing-medium)' }}
        />
      )}
      {isRunAsUserRuntime && (
        <MultiTypeTextField
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('pipeline.stepCommonFields.runAsUser')}</Text>}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.runAsUser`}
          multiTextInputProps={{
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly,
            placeholder: '1000'
          }}
          style={{ marginBottom: 'var(--spacing-medium)' }}
        />
      )}
      {(isLimitMemoryRuntime || isLimitCPURuntime) && (
        <>
          <Text tooltipProps={{ dataTooltipId: 'setContainerResources' }}>
            {getString('pipelineSteps.setContainerResources')}
          </Text>
          <div
            className={cx(css.fieldsGroup, css.withoutSpacing, css.withoutAligning)}
            style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
          >
            {isLimitMemoryRuntime && (
              <MultiTypeTextField
                name={`${isEmpty(path) ? '' : `${path}.`}spec.resources.limits.memory`}
                label={
                  <Text style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-xsmall)' }}>
                    {getString('pipelineSteps.limitMemoryLabel')}
                  </Text>
                }
                style={{ flexGrow: 1, flexBasis: '50%' }}
                multiTextInputProps={{
                  placeholder: getString('pipelineSteps.limitMemoryPlaceholder'),
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
                  <Text style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-xsmall)' }}>
                    {getString('pipelineSteps.limitCPULabel')}
                  </Text>
                }
                style={{ flexGrow: 1, flexBasis: '50%' }}
                multiTextInputProps={{
                  placeholder: getString('pipelineSteps.limitCPUPlaceholder'),
                  disabled: readonly,
                  multiTextInputProps: {
                    expressions,
                    allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                  }
                }}
              />
            )}
          </div>
        </>
      )}
      {!withoutTimeout && isTimeoutRuntime && (
        <FormMultiTypeDurationField
          className={css.removeBpLabelMargin}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'timeout' }}>
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
      )}
    </>
  )
}

export default connect(StepCommonFieldsInputSet)
