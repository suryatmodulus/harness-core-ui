import React from 'react'
import { connect, FormikContext } from 'formik'
import { get } from 'lodash-es'
import { errorCheck } from '@common/utils/formikHelpers'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ConnectorReferenceFieldProps, ConnectorReferenceField } from './ConnectorReferenceField'
export interface FormConnectorFieldProps extends Omit<ConnectorReferenceFieldProps, 'onChange' | 'error'> {
  formik?: FormikContext<any>
}

const FormConnectorReference = (props: FormConnectorFieldProps): React.ReactElement => {
  const { name, formik, placeholder, disabled, ...restProps } = props
  const hasError = errorCheck(name, formik)
  const error = hasError ? get(formik?.errors, name) : undefined

  const selected = get(formik?.values, name, '')

  return (
    <ConnectorReferenceField
      {...restProps}
      name={name}
      placeholder={placeholder}
      selected={selected as ConnectorReferenceFieldProps['selected']}
      onChange={(record, scope) => {
        formik?.setFieldValue(
          name,
          scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record?.identifier}` : record?.identifier
        )
      }}
      error={error as string}
      disabled={disabled}
    />
  )
}

export const FormConnectorReferenceField = connect(FormConnectorReference)
