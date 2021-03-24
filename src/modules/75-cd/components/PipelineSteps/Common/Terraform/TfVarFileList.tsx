import React from 'react'

import { Layout, Text, Button } from '@wings-software/uicore'
import { get } from 'lodash-es'

import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import type { TerraformData } from './TerraformIntefaces'
import TfVarFile from './TfVarFile'
import css from './TerraformVarfile.module.scss'

interface TfVarFileProps {
  formik: FormikProps<TerraformData>
}
export default function TfVarFileList(props: TfVarFileProps): React.ReactElement {
  const { formik } = props
  const [showTfModal, setShowTfModal] = React.useState(false)
  const value = get(formik?.values?.spec?.configuration?.spec, 'varFiles')
  return (
    <FieldArray
      name="configuration.spec.varFiles"
      render={({ push, remove }) => {
        return (value || []).map((val, i) => (
          <>
            <Layout.Horizontal className={css.tfContainer}>
              <Text className={css.branch}>{val?.store?.spec?.branch}</Text>

              <Text className={css.path}>{val?.store?.spec?.paths?.[0]}</Text>

              <Button minimal icon="trash" data-testid={`remove-tfvar-file-${i}`} onClick={() => remove(i)} />

              <Button
                icon="plus"
                minimal
                intent="primary"
                data-testid="add-tfvar-file"
                onClick={() => setShowTfModal(true)}
              >
                Add
              </Button>
            </Layout.Horizontal>
            {showTfModal && (
              <TfVarFile
                formik={formik}
                onHide={() => {
                  push(i)
                  setShowTfModal(false)
                }}
              />
            )}
          </>
        ))
      }}
    />
  )
}
