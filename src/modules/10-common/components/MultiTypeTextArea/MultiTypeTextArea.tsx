import React from 'react'
import { FormGroup, IFormGroupProps, Intent, ITextAreaProps, TextArea } from '@blueprintjs/core'
import {
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  MultiTypeInputValue,
  FixedTypeComponentProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  DataTooltipInterface,
  HarnessDocTooltip,
  FormError
} from '@wings-software/uicore'
import { connect } from 'formik'
import { get } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'

import { errorCheck } from '@common/utils/formikHelpers'

import css from './MultiTypeTextArea.module.scss'

function MultiTypeTextAreaFixedTypeComponent(
  props: FixedTypeComponentProps & MultiTypeTextAreaProps['textAreaProps']
): React.ReactElement {
  const { onChange, value, ...restProps } = props
  return (
    <TextArea
      growVertically={false}
      {...restProps}
      className={cx(css.input, restProps.className)}
      value={value as string}
      onInput={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event.target.value, MultiTypeInputValue.STRING, MultiTypeInputType.FIXED)
      }}
    />
  )
}

interface MultiTypeTextAreaConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeTextAreaProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  textAreaProps?: Omit<ITextAreaProps, 'onChange' | 'value'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeTextAreaConfigureOptionsProps
}

export const MultiTypeTextArea: React.FC<MultiTypeTextAreaProps> = props => {
  const { name, value, onChange, enableConfigureOptions = true, textAreaProps, configureOptionsProps, ...rest } = props
  const { getString } = useStrings()
  const expressionAndRuntimeTypeComponent = (
    <ExpressionAndRuntimeType
      name={name}
      value={value}
      onChange={onChange}
      {...rest}
      fixedTypeComponentProps={textAreaProps}
      fixedTypeComponent={MultiTypeTextAreaFixedTypeComponent}
      style={{ flexGrow: 1 }}
      btnClassName={css.multiBtn}
    />
  )
  return (
    <>
      {enableConfigureOptions ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {expressionAndRuntimeTypeComponent}
          {getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={value as string}
              type={getString('string')}
              variableName={name}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={val => onChange?.(val, MultiTypeInputValue.STRING, MultiTypeInputType.RUNTIME)}
              style={{ marginLeft: 'var(--spacing-medium)' }}
              {...configureOptionsProps}
              isReadonly={props.disabled}
            />
          )}
        </div>
      ) : (
        expressionAndRuntimeTypeComponent
      )}
    </>
  )
}

export interface FormMultiTypeTextAreaProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  label: string | React.ReactElement
  name: string
  placeholder?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any // TODO: Remove this but not sure why FormikContext<any> was not working
  multiTypeTextArea?: Omit<MultiTypeTextAreaProps, 'name' | 'onChange'>
  onChange?: MultiTypeTextAreaProps['onChange']
  isOptional?: boolean
  tooltipProps?: DataTooltipInterface
}

export const FormMultiTypeTextArea: React.FC<FormMultiTypeTextAreaProps> = props => {
  const {
    label,
    multiTypeTextArea,
    placeholder,
    formik,
    name,
    onChange,
    isOptional = false,
    tooltipProps,
    ...restProps
  } = props
  const hasError = errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    ...rest
  } = restProps

  const value: string = get(formik?.values, name, '')
  const customProps: MultiTypeTextAreaProps = {
    ...multiTypeTextArea,
    name,
    textAreaProps: {
      ...multiTypeTextArea?.textAreaProps,
      name,
      placeholder,
      onBlur: () => formik?.setFieldTouched(name)
    }
  }

  const labelToPass = isOptional ? `${label} (Optional)` : label
  return (
    <FormGroup
      {...rest}
      labelFor={name}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
      label={
        labelToPass ? (
          <HarnessDocTooltip tooltipId={tooltipProps?.dataTooltipId} labelText={labelToPass} />
        ) : (
          labelToPass
        )
      }
    >
      <MultiTypeTextArea
        value={value}
        disabled={disabled}
        {...customProps}
        onChange={(val, valueType, type) => {
          formik?.setFieldValue(name, val)
          onChange?.(val, valueType, type)
        }}
      />
    </FormGroup>
  )
}

export const FormMultiTypeTextAreaField = connect(FormMultiTypeTextArea)
