import React from 'react'
import { Text, SelectOption, MultiTypeInputType } from '@wings-software/uicore'
import cx from 'classnames'
import { connect } from 'formik'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import type { PullOption } from '../PipelineSteps/Steps/StepsTypes'
import css from '../PipelineSteps/Steps/Steps.module.scss'

export type PullOptions = { label: string; value: PullOption }[]

export const usePullOptions: () => PullOptions = () => {
  const { getString } = useStrings()
  return [
    { label: getString('pipelineSteps.pullIfNotExistsLabel'), value: 'ifNotExists' },
    { label: getString('pipelineSteps.pullNeverLabel'), value: 'never' },
    { label: getString('pipelineSteps.pullAlwaysLabel'), value: 'always' }
  ]
}

export const GetShellOptions: () => SelectOption[] = () => {
  const { getString } = useStrings()
  return [
    { label: getString('common.bash'), value: 'Bash' },
    { label: getString('common.shell'), value: 'Sh' }
  ]
}
export const GetImagePullPolicyOptions: () => SelectOption[] = () => {
  const { getString } = useStrings()
  return [
    { label: getString('pipelineSteps.pullAlwaysLabel'), value: 'Always' },
    { label: getString('pipeline.stepCommonFields.ifNotPresent'), value: 'IfNotPresent' },
    { label: getString('pipelineSteps.pullNeverLabel'), value: 'Never' }
  ]
}

interface StepCommonFieldsProps {
  withoutTimeout?: boolean
  disabled?: boolean
  enableFields?: string[]
}

const StepCommonFields = ({ withoutTimeout, disabled, enableFields = [] }: StepCommonFieldsProps): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {enableFields.includes('spec.imagePullPolicy') && (
        <MultiTypeSelectField
          name="spec.imagePullPolicy"
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.pullLabel')}</Text>}
          multiTypeInputProps={{
            selectItems: GetImagePullPolicyOptions(),
            placeholder: getString('select'),
            multiTypeInputProps: {
              expressions,
              selectProps: { addClearBtn: true, items: GetImagePullPolicyOptions() },
              allowableTypes: [MultiTypeInputType.FIXED]
            },
            disabled
          }}
          disabled={disabled}
          configureOptionsProps={{ variableName: 'spec.imagePullPolicy' }}
          style={{ margin: 'var(--spacing-medium) 0' }}
        />
      )}
      {enableFields.includes('spec.shell') && (
        <MultiTypeSelectField
          name="spec.shell"
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('common.shell')}</Text>}
          multiTypeInputProps={{
            selectItems: GetImagePullPolicyOptions(),
            placeholder: getString('select'),
            multiTypeInputProps: {
              expressions,
              selectProps: { addClearBtn: true, items: GetShellOptions() },
              allowableTypes: [MultiTypeInputType.FIXED]
            },
            disabled
          }}
          disabled={disabled}
          configureOptionsProps={{ variableName: 'spec.shell' }}
          style={{ marginBottom: 'var(--spacing-medium)' }}
        />
      )}
      <MultiTypeTextField
        label={<Text margin={{ bottom: 'xsmall' }}>{getString('pipeline.stepCommonFields.runAsUser')}</Text>}
        name="spec.runAsUser"
        multiTextInputProps={{
          multiTextInputProps: { expressions },
          disabled,
          placeholder: '1000'
        }}
        style={{ marginBottom: 'var(--spacing-medium)' }}
      />
      <Text tooltipProps={{ dataTooltipId: 'setContainerResources' }}>
        {getString('pipelineSteps.setContainerResources')}
      </Text>
      <div
        className={cx(css.fieldsGroup, css.withoutSpacing, css.withoutAligning)}
        style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
      >
        <MultiTypeTextField
          name="spec.limitMemory"
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.limitMemoryLabel')}</Text>}
          multiTextInputProps={{
            placeholder: getString('pipelineSteps.limitMemoryPlaceholder'),
            multiTextInputProps: { expressions },
            disabled
          }}
          configureOptionsProps={{ variableName: 'spec.limit.memory' }}
          style={{ flexGrow: 1, flexBasis: '50%' }}
        />
        <MultiTypeTextField
          name="spec.limitCPU"
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.limitCPULabel')}</Text>}
          multiTextInputProps={{
            placeholder: getString('pipelineSteps.limitCPUPlaceholder'),
            multiTextInputProps: { expressions },
            disabled
          }}
          configureOptionsProps={{ variableName: 'spec.limit.cpu' }}
          style={{ flexGrow: 1, flexBasis: '50%' }}
        />
      </div>
      {!withoutTimeout && (
        <FormMultiTypeDurationField
          className={css.removeBpLabelMargin}
          name="timeout"
          multiTypeDurationProps={{ expressions }}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'timeout' }}>
              {getString('pipelineSteps.timeoutLabel')}
            </Text>
          }
          disabled={disabled}
          style={{ marginBottom: 0 }}
        />
      )}
    </>
  )
}

export default connect(StepCommonFields)
