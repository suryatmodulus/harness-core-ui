import React from 'react'
import type { IFormGroupProps } from '@blueprintjs/core'
import { connect, FormikContext } from 'formik'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, MultiTextInputProps } from '@wings-software/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'

// TODO: Need to import from uikit but right now it is not being exported from there
// Also, we need to make field label to be a type of string | ReactElement because sometimes we need to pass an element
interface MultiTextTypeInputProps extends Omit<IFormGroupProps, 'label' | 'labelFor'> {
  name: string
  label: string
  placeholder?: string
  onChange?: MultiTextInputProps['onChange']
  multiTextInputProps?: Omit<MultiTextInputProps, 'name'>
}

interface MultiTypeTextConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeTextProps {
  name: string
  label: string | React.ReactElement
  formik?: FormikContext<any>
  multiTextInputProps?: Omit<MultiTextTypeInputProps, 'name' | 'label'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeTextConfigureOptionsProps
  style?: React.CSSProperties
}

export function MultiTypeText(props: MultiTypeTextProps): React.ReactElement {
  const {
    label,
    name,
    formik,
    multiTextInputProps,
    enableConfigureOptions = true,
    configureOptionsProps,
    style
  } = props

  const value = get(formik?.values, name, '')

  const { getString } = useStrings()

  return (
    <div style={style}>
      {label}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormInput.MultiTextInput
          name={name}
          label=""
          style={{ marginBottom: 0, flexGrow: 1 }}
          {...multiTextInputProps}
        />
        {enableConfigureOptions && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={value}
            type={getString('string')}
            variableName={name}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={val => formik?.setFieldValue(name, val)}
            style={{ marginLeft: 'var(--spacing-medium)' }}
            {...configureOptionsProps}
            isReadonly={multiTextInputProps?.disabled}
          />
        )}
      </div>
    </div>
  )
}

export const MultiTypeTextField = connect(MultiTypeText)
