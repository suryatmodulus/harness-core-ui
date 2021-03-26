import React from 'react'

import { Layout, Text, Button } from '@wings-software/uicore'

import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import type { TerraformData, VarFileArray } from './TerraformIntefaces'
import TfVarFile from './TfVarFile'
import css from './TerraformVarfile.module.scss'

interface TfVarFileProps {
  formik: FormikProps<TerraformData>
}
export default function TfVarFileList(props: TfVarFileProps): React.ReactElement {
  const { formik } = props
  const [showTfModal, setShowTfModal] = React.useState(false)
  return (
    <FieldArray
      name="spec.configuration.spec.varFiles"
      render={({ push, remove }) => {
        return (
          <Layout.Vertical>
            {formik?.values?.spec?.configuration?.spec?.varFiles?.map((varFile: VarFileArray, i) => (
              <>
                <Layout.Horizontal className={css.tfContainer} key={varFile?.spec?.store?.spec?.connectorRef?.value}>
                  <Text className={css.branch}>{varFile?.spec?.store?.spec?.branch}</Text>

                  <Text className={css.path}>{varFile?.spec?.store?.spec?.paths?.[0]}</Text>

                  <Button minimal icon="trash" data-testid={`remove-tfvar-file-${i}`} onClick={() => remove(i)} />
                </Layout.Horizontal>
              </>
            ))}
            <Button
              icon="plus"
              minimal
              intent="primary"
              data-testid="add-tfvar-file"
              onClick={() => setShowTfModal(true)}
            >
              Add
            </Button>

            {showTfModal && (
              <TfVarFile
                formik={formik}
                onHide={() => {
                  // push(i)
                  setShowTfModal(false)
                }}
                onSubmit={values => {
                  push(values)
                  setShowTfModal(false)
                }}
              />
            )}
          </Layout.Vertical>
        )
      }}
    />
  )
}
