/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties, ReactChild } from 'react'
import {
  MultiTypeInputType,
  getMultiTypeFromValue,
  RUNTIME_INPUT_VALUE,
  FormError,
  FormikTooltipContext,
  DataTooltipInterface,
  HarnessDocTooltip,
  FormInput
} from '@wings-software/uicore'
import { IFormGroupProps, Intent, FormGroup } from '@blueprintjs/core'
import { FormikContext, connect } from 'formik'
import { get } from 'lodash-es'
import { errorCheck } from '@common/utils/formikHelpers'
import MultiTypeSelectorButton from '../MultiTypeSelectorButton/MultiTypeSelectorButton'

import css from './MultiTypeFieldSelctor.module.scss'

export interface MultiTypeFieldSelectorProps extends Omit<IFormGroupProps, 'label' | 'placeholder'> {
  children: Exclude<React.ReactNode, null | undefined>
  name: string
  label: string | ReactChild
  defaultValueToReset?: unknown
  style?: CSSProperties
  disableTypeSelection?: boolean
  skipRenderValueInExpressionLabel?: boolean
  expressionRender?(): React.ReactNode
  allowedTypes?: MultiTypeInputType[]
  isOptional?: boolean
  optionalLabel?: string
  tooltipProps?: DataTooltipInterface
}

export interface ConnectedMultiTypeFieldSelectorProps extends MultiTypeFieldSelectorProps {
  formik: FormikContext<any>
}

export function MultiTypeFieldSelector(props: ConnectedMultiTypeFieldSelectorProps): React.ReactElement | null {
  const {
    formik,
    label,
    name,
    children,
    defaultValueToReset,
    disableTypeSelection,
    allowedTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
    expressionRender,
    skipRenderValueInExpressionLabel,
    isOptional,
    optionalLabel = '(optional)',
    ...restProps
  } = props
  const error = get(formik?.errors, name)
  const hasError = errorCheck(name, formik) && typeof error === 'string'
  const labelText = !isOptional ? label : `${label} ${optionalLabel}`
  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError errorMessage={get(formik?.errors, name)} /> : null,
    disabled,
    ...rest
  } = restProps

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  const value: string = get(formik?.values, name, '')

  const [type, setType] = React.useState(getMultiTypeFromValue(value))

  function handleChange(newType: MultiTypeInputType): void {
    setType(newType)
    if (newType === type) return
    formik.setFieldValue(name, newType === MultiTypeInputType.RUNTIME ? RUNTIME_INPUT_VALUE : defaultValueToReset)
  }

  if (type === MultiTypeInputType.RUNTIME && getMultiTypeFromValue(value) !== MultiTypeInputType.RUNTIME) return null

  return (
    <FormGroup
      {...rest}
      className={type === MultiTypeInputType.RUNTIME ? css.formGroup : ''}
      labelFor={name}
      helperText={helperText}
      intent={intent}
      disabled={disabled}
      label={
        <div className={css.formLabel}>
          <HarnessDocTooltip tooltipId={dataTooltipId} labelText={labelText} />
          {disableTypeSelection ? null : (
            <MultiTypeSelectorButton allowedTypes={allowedTypes} type={type} onChange={handleChange} />
          )}
        </div>
      }
    >
      {disableTypeSelection || type === MultiTypeInputType.FIXED ? (
        children
      ) : type === MultiTypeInputType.EXPRESSION && typeof expressionRender === 'function' ? (
        expressionRender()
      ) : type === MultiTypeInputType.RUNTIME && typeof value === 'string' ? (
        <FormInput.Text className={css.runtimeDisabled} name={name} disabled label="" />
      ) : null}
    </FormGroup>
  )
}

export default connect<MultiTypeFieldSelectorProps>(MultiTypeFieldSelector)
