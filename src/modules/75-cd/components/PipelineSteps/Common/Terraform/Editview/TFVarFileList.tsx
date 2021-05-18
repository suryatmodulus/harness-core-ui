import React from 'react'
import * as Yup from 'yup'

import cx from 'classnames'

import { Layout, Text, Button, Icon, FormInput, Formik, StepWizard, Color } from '@wings-software/uicore'
import { Classes, MenuItem, Popover, PopoverInteractionKind, Menu, Dialog, IDialogProps } from '@blueprintjs/core'
import { FieldArray, FieldArrayRenderProps, Form } from 'formik'
import type { FormikProps } from 'formik'

import { useStrings } from 'framework/strings'
import type { TerraformVarFileWrapper } from 'services/cd-ng'
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
  const inlineInitValues: TerraformVarFileWrapper = {
    varFile: {
      type: TerraformStoreTypes.Inline
    }
  }
  const remoteInitialValues: TerraformVarFileWrapper = {
    varFile: {
      type: TerraformStoreTypes.Remote
    }
  }
  const [showTfModal, setShowTfModal] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [selectedVar, setSelectedVar] = React.useState(inlineInitValues as TerraformVarFileWrapper)

  const [showRemoteWizard, setShowRemoteWizard] = React.useState(false)
  const { getString } = useStrings()

  const remoteRender = (varFile: TerraformVarFileWrapper) => {
    const remoteVar = varFile?.varFile as any
    return (
      <div className={css.configField}>
        <Layout.Horizontal>
          {varFile?.varFile?.type === getString('remote') && <Icon name="remote" />}
          <Text className={css.branch}>{remoteVar?.identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            setShowRemoteWizard(true)
            setSelectedVar(varFile)
            setIsEditMode(true)
          }}
        />
      </div>
    )
  }

  const inlineRender = (varFile: TerraformVarFileWrapper) => {
    const inlineVar = varFile?.varFile as any
    return (
      <div className={css.configField}>
        <Layout.Horizontal>
          {inlineVar?.type === getString('inline') && <Icon name="Inline" />}
          <Text className={css.branch}>{inlineVar?.identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            setShowTfModal(true)
            setIsEditMode(true)
            setSelectedVar(varFile)
          }}
        />
      </div>
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
      <Text color={Color.WHITE}>{getString('pipelineSteps.remoteFile')}</Text>
    </Layout.Vertical>
  )

  const onDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])

  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])

  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      /* istanbul ignore else */
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      /* istanbul ignore else */
      if (data) {
        const index = parseInt(data, 10)
        arrayHelpers.swap(index, droppedIndex)
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
  )

  return (
    <FieldArray
      name="spec.configuration.spec.varFiles"
      render={arrayHelpers => {
        return (
          <div>
            {formik?.values?.spec?.configuration?.spec?.varFiles?.map((varFile: TerraformVarFileWrapper, i) => {
              return (
                <Layout.Horizontal
                  className={css.addMarginTop}
                  key={`${varFile?.varFile?.spec?.type}`}
                  flex={{ distribution: 'space-between' }}
                  style={{ alignItems: 'end' }}
                >
                  <Layout.Horizontal
                    spacing="medium"
                    style={{ alignItems: 'baseline' }}
                    className={css.tfContainer}
                    key={varFile?.varFile?.spec?.type}
                    draggable={true}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDragStart={event => {
                      onDragStart(event, i)
                    }}
                    onDrop={event => onDrop(event, arrayHelpers, i)}
                  >
                    <Icon name="drag-handle-vertical" className={css.drag} />
                    {varFile?.varFile?.type === TerraformStoreTypes.Remote && remoteRender(varFile)}
                    {varFile?.varFile?.type === TerraformStoreTypes.Inline && inlineRender(varFile)}
                    <Button
                      minimal
                      icon="trash"
                      data-testid={`remove-tfvar-file-${i}`}
                      onClick={() => arrayHelpers.remove(i)}
                    />
                  </Layout.Horizontal>
                </Layout.Horizontal>
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
                    onClick={() => {
                      setShowTfModal(true)
                    }}
                  />

                  <MenuItem
                    text={<Text intent="primary">{getString('cd.addRemote')}</Text>}
                    icon={<Icon name="remote" />}
                    onClick={() => setShowRemoteWizard(true)}
                  />
                </Menu>
              }
            >
              <Button icon="plus" minimal intent="primary" data-testid="add-tfvar-file" className={css.addTfVarFile}>
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
                    <TFVarStore
                      name={getString('cd.tfVarStore')}
                      initialValues={isEditMode ? selectedVar : remoteInitialValues}
                      isEditMode={isEditMode}
                    />
                    <TFRemoteWizard
                      name={getString('cd.varFileDetails')}
                      onSubmitCallBack={(values: TerraformVarFileWrapper) => {
                        arrayHelpers.push(values)
                        setShowRemoteWizard(false)
                      }}
                      isEditMode={isEditMode}
                      // initialValues={remoteInitialValues}
                    />
                  </StepWizard>
                </div>
                <Button
                  minimal
                  icon="cross"
                  iconProps={{ size: 18 }}
                  onClick={() => {
                    setShowRemoteWizard(false)
                  }}
                  className={css.crossIcon}
                />
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
                    initialValues={selectedVar}
                    onSubmit={(values: any) => {
                      if (!isEditMode) {
                        arrayHelpers.push(values)
                        setShowTfModal(false)
                      }
                    }}
                    validationSchema={Yup.object().shape({
                      varFile: Yup.object().shape({
                        identifier: Yup.string().required(getString('common.validation.identifierIsRequired')),
                        spec: Yup.object().shape({
                          content: Yup.string().required(getString('cd.contentRequired'))
                        })
                      })
                    })}
                  >
                    {() => {
                      return (
                        <Form>
                          <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                          <FormInput.TextArea name="varFile.spec.content" label={getString('pipelineSteps.content')} />
                          <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                            <Button type="submit" intent={'primary'} text={getString('submit')} />
                          </Layout.Horizontal>
                        </Form>
                      )
                    }}
                  </Formik>
                </Layout.Vertical>
              </Dialog>
            )}
          </div>
        )
      }}
    />
  )
}
