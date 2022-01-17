/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect, FormikContext } from 'formik'
import {
  DataTooltipInterface,
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  FormikTooltipContext,
  HarnessDocTooltip,
  MultiTypeInputType
} from '@wings-software/uicore'
import { get } from 'lodash-es'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'

import { errorCheck } from '@common/utils/formikHelpers'
import { DelegateSelectors, DelegateSelectorsProps } from '@common/components/DelegateSelectors/DelegateSelectors'

import css from './MultiTypeDelegateSelector.module.scss'

export interface MultiTypeDelegateSelectorProps extends IFormGroupProps {
  name: string
  label?: string
  expressions?: string[]
  allowableTypes?: MultiTypeInputType[]
  tooltipProps?: DataTooltipInterface
  inputProps: Omit<DelegateSelectorsProps, 'onChange'>
}

export interface ConnectedMultiTypeDelegateSelectorProps extends MultiTypeDelegateSelectorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContext<any>
}

export function MultiTypeDelegateSelector(props: ConnectedMultiTypeDelegateSelectorProps): React.ReactElement {
  const { formik, label, name, expressions = [], inputProps, ...restProps } = props

  const value = get(formik.values, name)
  const hasError = errorCheck(name, formik)

  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? get(formik.errors, name) : null,
    disabled,
    ...rest
  } = restProps

  const handleChange: ExpressionAndRuntimeTypeProps['onChange'] = val => {
    formik.setFieldValue(name, val)
  }
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  return (
    <FormGroup
      {...rest}
      labelFor={name}
      label={label ? <HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} /> : label}
      intent={intent}
      helperText={helperText}
    >
      <ExpressionAndRuntimeType
        name={name}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        expressions={expressions}
        style={{ flexGrow: 1 }}
        fixedTypeComponentProps={{
          ...inputProps,
          wrapperClassName: css.wrapper,
          selectedItems: value,
          readonly: disabled
        }}
        fixedTypeComponent={DelegateSelectors as any}
        defaultValueToReset={[]}
        allowableTypes={props.allowableTypes}
      />
    </FormGroup>
  )
}

export default connect<MultiTypeDelegateSelectorProps>(MultiTypeDelegateSelector)
