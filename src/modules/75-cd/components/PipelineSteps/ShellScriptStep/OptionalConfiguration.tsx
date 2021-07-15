import React from 'react'
import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import {
  Button,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTextInput,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import cx from 'classnames'
import { FormGroup, Intent, IOptionProps } from '@blueprintjs/core'
import { get } from 'lodash-es'

import { errorCheck } from '@common/utils/formikHelpers'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'

import type { ShellScriptFormData, ShellScriptOutputStepVariable, ShellScriptStepVariable } from './shellScriptTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ShellScript.module.scss'

export const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

export const targetTypeOptions: IOptionProps[] = [
  {
    label: 'Specify Target Host',
    value: 'targethost'
  },
  {
    label: 'On Delegate',
    value: 'delegate'
  }
]

export const scriptOutputType: SelectOption[] = [{ label: 'String', value: 'String' }]

export default function OptionalConfiguration(props: {
  formik: FormikProps<ShellScriptFormData>
  readonly?: boolean
}): React.ReactElement {
  const { formik, readonly } = props
  const { values: formValues, setFieldValue } = formik
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const updateInputFieldValue = (value: string | number, index: number, path: string): void => {
    if (formValues.spec.environmentVariables?.[index].type === 'Number') {
      value = parseFloat(value as string)
      setFieldValue(path, value)
    } else {
      setFieldValue(path, value)
    }
  }

  return (
    <div className={stepCss.stepPanel}>
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.environmentVariables"
          label={getString('pipeline.scriptInputVariables')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          defaultValueToReset={[]}
          disableTypeSelection
        >
          <FieldArray
            name="spec.environmentVariables"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.environmentVarHeader}>
                    <span className={css.label}>Name</span>
                    <span className={css.label}>Type</span>
                    <span className={css.label}>Value</span>
                  </div>
                  {formValues.spec.environmentVariables?.map(({ id }: ShellScriptStepVariable, i: number) => {
                    const valueFieldName = `spec.environmentVariables[${i}].value`
                    const valueHasError = errorCheck(valueFieldName, formik)

                    return (
                      <div className={css.environmentVarHeader} key={id}>
                        <FormInput.Text name={`spec.environmentVariables[${i}].name`} disabled={readonly} />
                        <FormInput.Select
                          items={scriptInputType}
                          name={`spec.environmentVariables[${i}].type`}
                          placeholder={getString('typeLabel')}
                          disabled={readonly}
                        />
                        <FormGroup
                          intent={valueHasError ? Intent.DANGER : Intent.NONE}
                          helperText={valueHasError ? get(formik?.errors, valueFieldName) : null}
                        >
                          <MultiTextInput
                            name={valueFieldName}
                            expressions={expressions}
                            textProps={{
                              type: formValues.spec.environmentVariables?.[i].type === 'Number' ? 'number' : 'text',
                              name: valueFieldName
                            }}
                            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                            value={formValues.spec.environmentVariables?.[i].value as string}
                            intent={valueHasError ? Intent.DANGER : Intent.NONE}
                            onChange={value =>
                              updateInputFieldValue(
                                value as string | number,
                                i,
                                `spec.environmentVariables[${i}].value`
                              )
                            }
                            disabled={readonly}
                          />
                        </FormGroup>
                        <Button
                          minimal
                          icon="main-trash"
                          data-testid={`remove-environmentVar-${i}`}
                          onClick={() => remove(i)}
                          disabled={readonly}
                        />
                      </div>
                    )
                  })}
                  <Button
                    icon="plus"
                    minimal
                    intent="primary"
                    data-testid="add-environmentVar"
                    disabled={readonly}
                    onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                  >
                    {getString('addInputVar')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </div>
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.outputVariables"
          label={getString('pipeline.scriptOutputVariables')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          defaultValueToReset={[]}
          disableTypeSelection
        >
          <FieldArray
            name="spec.outputVariables"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.outputVarHeader}>
                    <span className={css.label}>Name</span>
                    <span className={css.label}>Type</span>
                    <span className={css.label}>Value</span>
                  </div>
                  {formValues.spec.outputVariables?.map(({ id }: ShellScriptOutputStepVariable, i: number) => (
                    <div className={css.outputVarHeader} key={id}>
                      <FormInput.Text name={`spec.outputVariables[${i}].name`} disabled={readonly} />
                      <FormInput.Select
                        items={scriptOutputType}
                        name={`spec.outputVariables[${i}].type`}
                        placeholder={getString('typeLabel')}
                        disabled={readonly}
                      />
                      <FormInput.MultiTextInput
                        name={`spec.outputVariables[${i}].value`}
                        multiTextInputProps={{
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                          expressions,
                          disabled: readonly
                        }}
                        label=""
                        disabled={readonly}
                      />
                      <Button minimal icon="main-trash" onClick={() => remove(i)} disabled={readonly} />
                    </div>
                  ))}
                  <Button
                    icon="plus"
                    minimal
                    intent="primary"
                    onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                    disabled={readonly}
                  >
                    {getString('addOutputVar')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </div>
      <div className={stepCss.formGroup}>
        <FormInput.RadioGroup
          name="spec.onDelegate"
          label={getString('pipeline.executionTarget')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          radioGroup={{ inline: true }}
          items={targetTypeOptions}
          className={css.radioGroup}
          disabled={readonly}
        />
      </div>
      {formValues.spec.onDelegate === 'targethost' ? (
        <div>
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTextInput
              name="spec.executionTarget.host"
              label={getString('targetHost')}
              style={{ marginTop: 'var(--spacing-small)' }}
              multiTextInputProps={{ expressions, disabled: readonly }}
              disabled={readonly}
            />
            {getMultiTypeFromValue(formValues.spec.executionTarget.host) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={formValues.spec.executionTarget.host}
                type="String"
                variableName="spec.executionTarget.host"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => setFieldValue('spec.executionTarget.host', value)}
                style={{ marginTop: 12 }}
                isReadonly={readonly}
              />
            )}
          </div>
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <MultiTypeSecretInput
              type="SSHKey"
              name="spec.executionTarget.connectorRef"
              label={getString('sshConnector')}
              expressions={expressions}
              disabled={readonly}
            />
            {getMultiTypeFromValue(formValues?.spec.executionTarget.connectorRef) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={formValues?.spec.executionTarget.connectorRef as string}
                type={
                  <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                    <Text>{getString('pipelineSteps.connectorLabel')}</Text>
                  </Layout.Horizontal>
                }
                variableName="spec.executionTarget.connectorRef"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  setFieldValue('spec.executionTarget.connectorRef', value)
                }}
                style={{ marginTop: 4 }}
                isReadonly={readonly}
              />
            )}
          </div>
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTextInput
              name="spec.executionTarget.workingDirectory"
              label={getString('workingDirectory')}
              style={{ marginTop: 'var(--spacing-medium)' }}
              disabled={readonly}
              multiTextInputProps={{ expressions, disabled: readonly }}
            />
            {getMultiTypeFromValue(formValues.spec.executionTarget.workingDirectory) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={formValues.spec.executionTarget.workingDirectory}
                type="String"
                variableName="spec.executionTarget.workingDirectory"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => setFieldValue('spec.executionTarget.workingDirectory', value)}
                style={{ marginTop: 12 }}
                isReadonly={readonly}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
