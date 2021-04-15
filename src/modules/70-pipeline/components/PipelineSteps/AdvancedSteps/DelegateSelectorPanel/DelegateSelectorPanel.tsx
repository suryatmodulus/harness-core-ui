import React from 'react'
import type { FormikProps } from 'formik'
import { DelegateSelectors } from '@common/components'
import { useStrings } from 'framework/exports'

export interface DelegatePanelProps {
  formikProps: FormikProps<{
    delegateSelectors?: string[]
  }>
  isReadonly: boolean
}

export default function DelegateSelectorPanel(props: DelegatePanelProps): React.ReactElement {
  const { getString } = useStrings()

  const { setFieldValue, values } = props.formikProps

  return (
    <DelegateSelectors
      fill
      allowNewTag={false}
      placeholder={getString('delegate.DelegateselectionPlaceholder')}
      onChange={data => {
        setFieldValue('delegateSelectors', data)
      }}
      readonly={props.isReadonly}
      selectedItems={values.delegateSelectors}
    />
  )
}
