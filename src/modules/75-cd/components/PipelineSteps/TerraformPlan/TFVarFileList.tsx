import React from 'react'

import { Layout, Text, Button, Icon } from '@wings-software/uicore'

import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import type { InlineTerraformVarFileSpec, RemoteTerraformVarFileSpec, TerraformVarFileWrapper } from 'services/cd-ng'

import { TerraformStoreTypes, TFPlanFormData } from '../Common/Terraform/TerraformInterfaces'
import TfVarFile from '../Common/Terraform/Editview/TfVarFile'
import css from './TerraformVarfile.module.scss'

interface TfVarFileProps {
  formik: FormikProps<TFPlanFormData>
}

export default function TfVarFileList(props: TfVarFileProps): React.ReactElement {
  const { formik } = props
  const [showTfModal, setShowTfModal] = React.useState(false)
  const { getString } = useStrings()

  const remoteRender = (varFile: TerraformVarFileWrapper) => {
    const remoteVarFile = varFile?.varFile as RemoteTerraformVarFileSpec
    return (
      <>
        <Text className={css.branch}>{remoteVarFile.store?.spec?.branch}</Text>
        <Layout.Horizontal className={css.path}>
          {varFile?.varFile?.type === getString('remote') && <Icon name="remote" />}
          {varFile?.varFile?.type === getString('inline') && <Icon name="Inline" />}
          {remoteVarFile?.store?.spec?.paths && remoteVarFile?.store?.spec?.paths?.[0].path && (
            <Text>{remoteVarFile?.store?.spec?.paths?.[0].path}</Text>
          )}
        </Layout.Horizontal>
      </>
    )
  }

  const inlineRender = (varFile: TerraformVarFileWrapper) => {
    const inlineVar = varFile?.varFile as InlineTerraformVarFileSpec
    return (
      <Layout.Horizontal className={css.path}>
        {inlineVar?.type === getString('inline') && <Icon name="Inline" />}
        <Text className={css.branch}>{inlineVar?.content}</Text>
      </Layout.Horizontal>
    )
  }
  return (
    <FieldArray
      name="spec.configuration.varFiles"
      render={({ push, remove }) => {
        return (
          <div>
            {formik?.values?.spec?.configuration?.varFiles?.map((varFile: TerraformVarFileWrapper, i) => {
              return (
                <div className={css.addMarginTop} key={i}>
                  <Layout.Horizontal className={css.tfContainer}>
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
