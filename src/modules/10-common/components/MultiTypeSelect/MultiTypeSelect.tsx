import React from 'react'
import type { IFormGroupProps } from '@blueprintjs/core'
import { connect, FormikContext } from 'formik'
import {
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  MultiTypeInputProps,
  SelectOption
} from '@wings-software/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'

interface FormMultiTypeInputProps extends Omit<IFormGroupProps, 'labelFor'> {
  name: string
  label: string
  placeholder?: string
  selectItems: SelectOption[]
  multiTypeInputProps?: Omit<MultiTypeInputProps, 'name'>
}

interface MultiTypeSelectConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'> {
  variableName?: ConfigureOptionsProps['variableName']
}

export interface MultiTypeSelectProps {
  name: string
  label: string | React.ReactElement
  formik?: FormikContext<any>
  multiTypeInputProps: Omit<FormMultiTypeInputProps, 'name' | 'label'>
  enableConfigureOptions?: boolean
  configureOptionsProps?: MultiTypeSelectConfigureOptionsProps
  style?: React.CSSProperties
  disabled?: boolean
}

export function MultiTypeSelect(props: MultiTypeSelectProps): React.ReactElement {
  const {
    label,
    name,
    formik,
    multiTypeInputProps,
    enableConfigureOptions = true,
    configureOptionsProps,
    style,
    disabled = false
  } = props

  const value = get(formik?.values, name, '')

  const { getString } = useStrings()

  return (
    <div style={style}>
      {label}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormInput.MultiTypeInput
          name={name}
          label=""
          style={{ marginBottom: 0, flexGrow: 1 }}
          {...multiTypeInputProps}
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
            isReadonly={disabled}
          />
        )}
      </div>
    </div>
  )
}

export const MultiTypeSelectField = connect(MultiTypeSelect)
