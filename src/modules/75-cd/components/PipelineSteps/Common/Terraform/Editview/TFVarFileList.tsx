import React from 'react'
import cx from 'classnames'

import { Layout, Text, Button, Icon, FormInput, Formik, StepWizard, Color } from '@wings-software/uicore'
import { Classes, MenuItem, Popover, PopoverInteractionKind, Menu, Dialog, IDialogProps } from '@blueprintjs/core'
import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'

import { useStrings } from 'framework/strings'
import type { InlineTerraformVarFileSpec, RemoteTerraformVarFileSpec, TerraformVarFileWrapper } from 'services/cd-ng'
import { TerraformData, TerraformStoreTypes } from '../TerraformInterfaces'
import { TFRemoteWizard } from './TFRemoteWizard'
import { TFVarStore } from './TFVarStore'
import css from './TerraformVarfile.module.scss'

// import TFRemoteWizard from './TFRemoteWizard'

interface TfVarFileProps {
  formik: FormikProps<TerraformData>
}

export default function TfVarFileList(props: TfVarFileProps): React.ReactElement {
  const { formik } = props
  const [showTfModal, setShowTfModal] = React.useState(false)
  const [showRemoteWizard, setShowRemoteWizard] = React.useState(false)
  const { getString } = useStrings()

  const remoteRender = (varFile: TerraformVarFileWrapper) => {
    const remoteVar = varFile?.varFile as RemoteTerraformVarFileSpec
    return (
      <>
        <Text className={css.branch}>{remoteVar?.store?.spec?.branch}</Text>
        <Layout.Horizontal className={css.path}>
          {varFile?.varFile?.type === getString('remote') && <Icon name="remote" />}
          {varFile?.varFile?.type === getString('inline') && <Icon name="Inline" />}
          {remoteVar?.store?.spec?.paths && remoteVar?.store?.spec?.paths?.[0].path && (
            <Text>{remoteVar?.store?.spec?.paths?.[0].path}</Text>
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

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const getTitle = () => (
    <Layout.Vertical flex style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Icon name="remote" />
      <Text color={Color.WHITE}>Remote File</Text>
    </Layout.Vertical>
  )
  return (
    <FieldArray
      name="spec.configuration.spec.varFiles"
      render={({ push, remove }) => {
        return (
          <div>
            {formik?.values?.spec?.configuration?.spec?.varFiles?.map((varFile: TerraformVarFileWrapper, i) => {
              return (
                <div className={css.addMarginTop} key={`${varFile?.varFile?.spec?.type}`}>
                  <Layout.Horizontal className={css.tfContainer} key={varFile?.varFile?.spec?.type}>
                    {varFile?.varFile?.type === TerraformStoreTypes.Remote && remoteRender(varFile)}
                    {varFile?.varFile?.type === TerraformStoreTypes.Inline && inlineRender(varFile)}
                    <Button minimal icon="trash" data-testid={`remove-tfvar-file-${i}`} onClick={() => remove(i)} />
                  </Layout.Horizontal>
                </div>
              )
            })}
            <Popover
              interactionKind={PopoverInteractionKind.CLICK}
              boundary="viewport"
              popoverClassName={Classes.DARK}
              content={
                <Menu className={css.tfMenu}>
                  <MenuItem
                    text={<Text intent="primary">{getString('cd.addInline')} </Text>}
                    icon={<Icon name="Inline" />}
                    onClick={() => setShowTfModal(true)}
                  />

                  <MenuItem
                    text={<Text intent="primary">{getString('cd.addRemote')}</Text>}
                    icon={<Icon name="remote" />}
                    onClick={() => setShowRemoteWizard(true)}
                  />
                </Menu>
              }
            >
              <Button icon="plus" minimal intent="primary" data-testid="add-tfvar-file">
                {getString('pipelineSteps.addTerraformVarFile')}
              </Button>
            </Popover>
            {showRemoteWizard && (
              <Dialog
                {...DIALOG_PROPS}
                isOpen={true}
                isCloseButtonShown
                onClose={() => {
                  setShowRemoteWizard(false)
                }}
                className={cx(css.modal, Classes.DIALOG)}
              >
                <div className={css.createTfWizard}>
                  <StepWizard title={getTitle()} initialStep={1} className={css.manifestWizard}>
                    <TFVarStore name={getString('cd.tfVarStore')} />
                    <TFRemoteWizard name={getString('cd.varFileDetails')} />
                  </StepWizard>
                </div>
              </Dialog>
            )}
            {showTfModal && (
              <Dialog
                isOpen={true}
                title="Add Inline Terraform Var File"
                isCloseButtonShown
                onClose={() => {
                  setShowTfModal(false)
                }}
                className={Classes.DIALOG}
              >
                <Layout.Vertical padding="medium">
                  <Formik
                    initialValues={{ varFile: { type: TerraformStoreTypes.Inline, content: '' } }}
                    onSubmit={(values: any) => {
                      push(values)
                    }}
                  >
                    {formikProps => {
                      return (
                        <>
                          <FormInput.TextArea name="varFile.content" label={getString('pipelineSteps.content')} />
                          <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                            <Button
                              type={'submit'}
                              intent={'primary'}
                              text={getString('submit')}
                              onClick={() => {
                                push(formikProps.values)
                                setShowTfModal(false)
                              }}
                            />
                          </Layout.Horizontal>
                        </>
                      )
                    }}
                  </Formik>
                </Layout.Vertical>
              </Dialog>
              // <TfVarFile
              //   onHide={() => {
              //     /* istanbul ignore next */
              //     setShowTfModal(false)
              //   }}
              //   onSubmit={(values: any) => {
              //     /* istanbul ignore next */
              //     push(values)
              //     /* istanbul ignore next */
              //     setShowTfModal(false)
              //   }}
              // />
            )}
          </div>
        )
      }}
    />
  )
}
