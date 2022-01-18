/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { FormGroup, Intent } from '@blueprintjs/core'
import { get } from 'lodash-es'
import type { FormikContext } from 'formik'
import {
  DataTooltipInterface,
  ExpressionAndRuntimeType,
  ExpressionAndRuntimeTypeProps,
  FormError,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'
import UserGroupsInput, { FormikUserGroupsInput } from './UserGroupsInput'
import css from './UserGroupsInput.module.scss'

export interface FormMultiTypeUserGroupInputProps
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  label: string
  tooltipProps?: DataTooltipInterface
  formik?: FormikContext<any>
  expressions?: string[]
}

export type Extended = FormikUserGroupsInput & FormMultiTypeUserGroupInputProps

export const FormMultiTypeUserGroupInput: React.FC<Extended> = props => {
  const { disabled, children, label, tooltipProps, formik, name, expressions, ...rest } = props

  const value = get(formik?.values, name)
  const fixedTypeComponent = useCallback(() => {
    return (
      <UserGroupsInput label="" tooltipProps={tooltipProps} name={name} disabled={disabled}>
        {children}
      </UserGroupsInput>
    )
  }, [value])

  const formError = get(formik?.errors, name)
  const [multiType, setMultiType] = useState<MultiTypeInputType>(getMultiTypeFromValue(value))

  // Don't show formError if type is fixed, as that is handled inside UserGroupInput.tsx
  const showFormError = formError && multiType !== MultiTypeInputType.FIXED

  return (
    <FormGroup
      helperText={showFormError ? <FormError errorMessage={formError} /> : null}
      intent={formError ? Intent.DANGER : Intent.NONE}
      label={<HarnessDocTooltip tooltipId={tooltipProps?.dataTooltipId} labelText={label} />}
    >
      <ExpressionAndRuntimeType
        value={value as string}
        name={name}
        disabled={disabled}
        {...rest}
        fixedTypeComponent={fixedTypeComponent}
        className={css.multiTypeSupport}
        expressions={expressions}
        onChange={(changedValue, _unusedValueType, changedMultiType: MultiTypeInputType) => {
          setMultiType(changedMultiType)
          if (changedMultiType === MultiTypeInputType.RUNTIME) {
            formik.setFieldValue(name, RUNTIME_INPUT_VALUE)
          } else if (changedMultiType === MultiTypeInputType.EXPRESSION) {
            formik.setFieldValue(name, changedValue || '')
          } else {
            formik.setFieldValue(name, [])
          }
        }}
      />
    </FormGroup>
  )
}
