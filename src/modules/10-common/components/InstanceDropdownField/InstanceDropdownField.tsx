import React from 'react'
import { Button, getMultiTypeFromValue, MultiTextInput, MultiTypeInputType } from '@wings-software/uicore'
import {
  FormGroup,
  HTMLInputProps,
  IFormGroupProps,
  IInputGroupProps,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position
} from '@blueprintjs/core'
import { connect } from 'formik'
import { get, isNil } from 'lodash-es'
import * as Yup from 'yup'
import { useStrings } from 'framework/exports'
import { errorCheck } from '@common/utils/formikHelpers'
// import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import css from './InstanceDropdownField.module.scss'

export enum InstanceTypes {
  Percentage = 'Percentage',
  Instances = 'Count'
}
export interface InstanceFieldValue {
  type: InstanceTypes
  spec: {
    percentage?: number | string
    count?: number | string
  }
}
export interface GetDurationValidationSchemaProps {
  maximum?: number
  required?: boolean
  requiredErrorMessage?: string
  minimumErrorMessage?: string
  maximumErrorMessage?: string
}

export function getInstanceDropdownSchema(props: GetDurationValidationSchemaProps = {}): Yup.ObjectSchema {
  const { maximum } = props

  if (maximum && typeof maximum !== 'number') {
    throw new Error(`Invalid format "${maximum}" provided for maximum value`)
  }
  return Yup.object({
    type: Yup.string().test({
      test(val: InstanceTypes): boolean | Yup.ValidationError {
        const { maximumErrorMessage, minimumErrorMessage, required = false, requiredErrorMessage } = props
        let type: InstanceTypes | undefined = val
        if (isNil(val)) {
          if (!isNil(this.parent?.spec?.count)) {
            type = InstanceTypes.Instances
          } else if (!isNil(this.parent?.spec?.percentage)) {
            type = InstanceTypes.Percentage
          }
        }
        if (type === InstanceTypes.Instances) {
          const value = this.parent?.spec?.count
          if (getMultiTypeFromValue((value as unknown) as string) !== MultiTypeInputType.FIXED) {
            return true
          }
          if (required && isNil(value)) {
            return this.createError({
              message: requiredErrorMessage || `Instance is an required field"`
            })
          } else if (value < 0) {
            return this.createError({
              message: minimumErrorMessage || `Instances must be greater than or equal to 0`
            })
          } else if (maximum && value > maximum) {
            return this.createError({
              message: maximumErrorMessage || `Instances must be less than or equal to "${maximum}"`
            })
          }
        } else if (type === InstanceTypes.Percentage) {
          const value = this.parent?.spec?.percentage
          if (required && isNil(value)) {
            return this.createError({
              message: requiredErrorMessage || `Instance is a required field"`
            })
          } else if (value < 0) {
            return this.createError({
              message: minimumErrorMessage || `Percentage must be greater than or equal to 0`
            })
          } else if (value > 100) {
            return this.createError({
              message: maximumErrorMessage || `Percentage must be less than or equal to 100`
            })
          }
        }
        return true
      }
    })
  })
}
interface InstanceDropdownFieldProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  onChange?: (value: InstanceFieldValue) => void
  value: InstanceFieldValue
  label: string
  disabledType?: boolean
  readonly?: boolean
  name: string
  textProps?: Omit<IInputGroupProps & HTMLInputProps, 'onChange' | 'value' | 'type' | 'placeholder'>
}

export const InstanceDropdownField: React.FC<InstanceDropdownFieldProps> = ({
  value,
  label,
  name,
  onChange,
  disabledType = false,
  textProps,
  readonly,
  ...restProps
}): JSX.Element => {
  const { getString } = useStrings()
  let isPercentageType = value.type === InstanceTypes.Percentage
  if (isNil(value.type)) {
    if (!isNil(value.spec.percentage)) {
      isPercentageType = true
    } else {
      isPercentageType = false
    }
  }
  const selectedText = isPercentageType
    ? getString('instanceFieldOptions.percentageText')
    : getString('instanceFieldOptions.instanceText')
  return (
    <FormGroup labelFor={name} label={label} className={css.formGroup} {...restProps}>
      <MultiTextInput
        name={`${name}.spec.${isPercentageType ? 'percentage' : 'count'}`}
        textProps={{
          type: 'number',
          placeholder: isPercentageType
            ? getString('instanceFieldOptions.percentagePlaceHolder')
            : getString('instanceFieldOptions.instanceHolder'),
          ...textProps,
          min: 0
        }}
        onChange={(val, _valType, typeInput) => {
          if (typeInput === MultiTypeInputType.FIXED && typeof val === 'string') {
            if (isPercentageType && val) {
              onChange?.({ ...value, spec: { percentage: parseFloat(val) } })
            } else {
              onChange?.({ ...value, spec: { count: parseFloat(val) } })
            }
          } else {
            if (isPercentageType && val) {
              onChange?.({ ...value, spec: { percentage: (val as unknown) as number } })
            } else {
              onChange?.({ ...value, spec: { count: (val as unknown) as number } })
            }
          }
        }}
        disabled={readonly}
        key={isPercentageType ? 'percent' : 'count'}
        value={((isPercentageType ? value.spec.percentage : value.spec.count) as unknown) as string}
      />

      <Popover
        disabled={disabledType}
        content={
          <Menu className={css.popMenu}>
            <MenuItem
              text={getString('instanceFieldOptions.percentageText')}
              onClick={() => {
                onChange?.({ spec: { percentage: undefined }, type: InstanceTypes.Percentage })
              }}
              data-name="percentage"
              disabled={readonly}
            />
            <MenuItem
              text={getString('instanceFieldOptions.instanceText')}
              onClick={() => {
                onChange?.({ spec: { count: undefined }, type: InstanceTypes.Instances })
              }}
              data-name="instances"
              disabled={readonly}
            />
          </Menu>
        }
        position={Position.BOTTOM}
        className={css.instancePopover}
      >
        <Button rightIcon="caret-down" disabled={disabledType} text={selectedText} minimal />
      </Popover>
    </FormGroup>
  )
}

export interface FormInstanceDropdownFieldProps extends Omit<InstanceDropdownFieldProps, 'value'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik?: any
  readonly?: boolean
}

const FormInstanceDropdownField: React.FC<FormInstanceDropdownFieldProps> = (props): JSX.Element => {
  const { label, textProps, formik, name, onChange, readonly, ...restProps } = props
  const hasError = errorCheck(`${name}.type`, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? get(formik?.errors, `${name}.type`) : null,
    disabled,
    ...rest
  } = restProps

  const value: InstanceFieldValue = get(formik?.values, name, { type: InstanceTypes.Instances, spec: { count: 0 } })

  return (
    <InstanceDropdownField
      label={label}
      name={name}
      textProps={{ ...textProps }}
      value={value}
      intent={intent}
      helperText={helperText}
      readonly={readonly}
      onChange={valueObj => {
        /* istanbul ignore next */
        formik.setFieldValue(name, { ...valueObj })
      }}
      {...rest}
    />
  )
}

export const FormInstanceDropdown = connect(FormInstanceDropdownField)
