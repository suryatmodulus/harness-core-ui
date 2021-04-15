import React from 'react'

import { Layout, Text, Button, Icon } from '@wings-software/uicore'

import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/exports'

import type { TerraformData, VarFileArray } from '../TerraformInterfaces'
import TfVarFile from './TfVarFile'
import css from './TerraformVarfile.module.scss'

interface TfVarFileProps {
  formik: FormikProps<TerraformData>
}
export default function TfVarFileList(props: TfVarFileProps): React.ReactElement {
  const { formik } = props
  const [showTfModal, setShowTfModal] = React.useState(false)
  const { getString } = useStrings()
  const remoteRender = (varFile: VarFileArray) => {
    return (
      <>
        <Text className={css.branch}>{varFile?.store?.spec?.branch}</Text>
        <Layout.Horizontal className={css.path}>
          {varFile?.type === getString('remote') && <Icon name="remote" />}
          {varFile?.type === getString('inline') && <Icon name="Inline" />}
          {varFile?.store?.spec?.paths && varFile?.store?.spec?.paths?.[0].path && (
            <Text>{varFile?.store?.spec?.paths?.[0].path}</Text>
          )}
        </Layout.Horizontal>
      </>
    )
  }

  const inlineRender = (varFile: VarFileArray) => {
    return (
      <Layout.Horizontal className={css.path}>
        {varFile?.type === getString('inline') && <Icon name="Inline" />}
        <Text className={css.branch}>{varFile?.store?.spec?.content}</Text>
      </Layout.Horizontal>
    )
  }
  return (
    <FieldArray
      name="spec.configuration.spec.varFiles"
      render={({ push, remove }) => {
        return (
          <div>
            {formik?.values?.spec?.configuration?.spec?.varFiles?.map((varFile: VarFileArray, i) => (
              <div className={css.addMarginTop} key={`${varFile?.store?.spec?.connectorRef?.label} ${i}`}>
                <Layout.Horizontal className={css.tfContainer} key={varFile?.store?.spec?.connectorRef?.value}>
                  {varFile?.type === getString('remote') && remoteRender(varFile)}
                  {varFile?.type === getString('inline') && inlineRender(varFile)}

                  <Button minimal icon="trash" data-testid={`remove-tfvar-file-${i}`} onClick={() => remove(i)} />
                </Layout.Horizontal>
              </div>
            ))}
            <Button
              icon="plus"
              minimal
              intent="primary"
              data-testid="add-tfvar-file"
              onClick={() => setShowTfModal(true)}
            >
              {getString('pipelineSteps.addTerraformVarFile')}
            </Button>

            {showTfModal && (
              <TfVarFile
                onHide={() => {
                  // push(i)
                  setShowTfModal(false)
                }}
                onSubmit={(values: any) => {
                  push(values)
                  setShowTfModal(false)
                }}
              />
            )}
          </div>
        )
      }}
    />
  )
}
