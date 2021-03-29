import React from 'react'

import { Layout, Text, Button, Icon } from '@wings-software/uicore'

import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import type { TerraformData, VarFileArray } from './TerraformInterfaces'
import TfVarFile from './TfVarFile'
import css from './TerraformVarfile.module.scss'

interface TfVarFileProps {
  formik: FormikProps<TerraformData>
}
export default function TfVarFileList(props: TfVarFileProps): React.ReactElement {
  const { formik } = props
  const [showTfModal, setShowTfModal] = React.useState(false)
  const remoteRender = (varFile: VarFileArray) => {
    return (
      <>
        <Text className={css.branch}>{varFile?.store?.spec?.branch}</Text>
        <Layout.Horizontal className={css.path}>
          {varFile?.type === 'Remote' && <Icon name="remote" />}
          {varFile?.type === 'Inline' && <Icon name="Inline" />}
          <Text>{varFile?.store?.spec?.paths?.[0].path}</Text>
        </Layout.Horizontal>
      </>
    )
  }

  const inlineRender = (varFile: VarFileArray) => {
    return (
      <Layout.Horizontal className={css.path}>
        {varFile?.type === 'Inline' && <Icon name="Inline" />}
        <Text className={css.branch}>{varFile?.store?.spec?.content}</Text>
      </Layout.Horizontal>
    )
  }
  return (
    <FieldArray
      name="spec.configuration.spec.varFiles"
      render={({ push, remove }) => {
        return (
          <Layout.Vertical>
            {formik?.values?.spec?.configuration?.spec?.varFiles?.map((varFile: VarFileArray, i) => (
              <>
                <Layout.Horizontal
                  className={css.tfContainer}
                  key={varFile?.store?.spec?.connectorRef?.value}
                  margin={{ top: 'small' }}
                >
                  {varFile?.type === 'Remote' && remoteRender(varFile)}
                  {varFile?.type === 'Inline' && inlineRender(varFile)}

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
