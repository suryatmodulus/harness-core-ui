import React from 'react'

import { Layout, Text, Button, Icon } from '@wings-software/uicore'

import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'

import { TerraformData, TerraformStoreTypes, VarFileArray } from '../TerraformInterfaces'
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
        <Text className={css.branch}>{varFile?.varFile?.store?.spec?.branch}</Text>
        <Layout.Horizontal className={css.path}>
          {varFile?.varFile?.type === getString('remote') && <Icon name="remote" />}
          {varFile?.varFile?.type === getString('inline') && <Icon name="Inline" />}
          {varFile?.varFile?.store?.spec?.paths && varFile?.varFile?.store?.spec?.paths?.[0].path && (
            <Text>{varFile?.varFile?.store?.spec?.paths?.[0].path}</Text>
          )}
        </Layout.Horizontal>
      </>
    )
  }

  const inlineRender = (varFile: VarFileArray) => {
    return (
      <Layout.Horizontal className={css.path}>
        {varFile?.varFile?.type === getString('inline') && <Icon name="Inline" />}
        <Text className={css.branch}>{varFile?.varFile?.store?.spec?.content}</Text>
      </Layout.Horizontal>
    )
  }
  return (
    <FieldArray
      name="spec.configuration.spec.varFiles"
      render={({ push, remove }) => {
        return (
          <div>
            {formik?.values?.spec?.configuration?.spec?.varFiles?.map((varFile: VarFileArray, i) => {
              return (
                <div className={css.addMarginTop} key={`${varFile?.varFile?.store?.spec?.connectorRef?.label} ${i}`}>
                  <Layout.Horizontal
                    className={css.tfContainer}
                    key={varFile?.varFile?.store?.spec?.connectorRef?.value}
                  >
                    {varFile?.varFile?.type === TerraformStoreTypes.Remote && remoteRender(varFile)}
                    {varFile?.varFile?.type === TerraformStoreTypes.Inline && inlineRender(varFile)}
                    <Button minimal icon="trash" data-testid={`remove-tfvar-file-${i}`} onClick={() => remove(i)} />
                  </Layout.Horizontal>
                </div>
              )
            })}
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
                  /* istanbul ignore next */
                  setShowTfModal(false)
                }}
                onSubmit={(values: any) => {
                  /* istanbul ignore next */
                  push(values)
                  /* istanbul ignore next */
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
