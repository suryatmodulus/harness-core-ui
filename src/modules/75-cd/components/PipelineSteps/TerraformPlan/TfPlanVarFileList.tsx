import React from 'react'

import cx from 'classnames'

import { Layout, Text, Button, Icon, StepWizard, Color, Label } from '@wings-software/uicore'
import { Classes, MenuItem, Popover, PopoverInteractionKind, Menu, Dialog, IDialogProps } from '@blueprintjs/core'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import type { FormikProps } from 'formik'

import { useStrings } from 'framework/strings'
import type { TerraformVarFileWrapper } from 'services/cd-ng'

import { RemoteVar, TFPlanFormData, TerraformStoreTypes } from '../Common/Terraform/TerraformInterfaces'
import { TFRemoteWizard } from '../Common/Terraform/Editview/TFRemoteWizard'
import { TFVarStore } from '../Common/Terraform/Editview/TFVarStore'

import InlineVarFile from '../Common/Terraform/Editview/InlineVarFile'

import css from '../Common/Terraform/Editview/TerraformVarfile.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

// import TFRemoteWizard from './TFRemoteWizard'

interface TfVarFileProps {
  formik: FormikProps<TFPlanFormData>
  isReadonly?: boolean
}

export default function TfVarFileList(props: TfVarFileProps): React.ReactElement {
  const { formik, isReadonly = false } = props
  const inlineInitValues: TerraformVarFileWrapper = {
    varFile: {
      identifier: '',
      spec: {},
      type: TerraformStoreTypes.Inline
    }
  }
  const remoteInitialValues: TerraformVarFileWrapper = {
    varFile: {
      identifier: '',
      spec: {},
      type: TerraformStoreTypes.Remote
    }
  }

  const [showTfModal, setShowTfModal] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [selectedVar, setSelectedVar] = React.useState(inlineInitValues as any)
  const [selectedVarIndex, setSelectedVarIndex] = React.useState<number>(-1)

  const [showRemoteWizard, setShowRemoteWizard] = React.useState(false)
  const { getString } = useStrings()

  const remoteRender = (varFile: TerraformVarFileWrapper, index: number) => {
    const remoteVar = varFile?.varFile as any
    return (
      <div className={css.configField} data-name={`edit-remote-${index}`}>
        <Layout.Horizontal>
          {varFile?.varFile?.type === getString('remote') && <Icon name="remote" className={css.iconPosition} />}
          <Text className={css.branch}>{remoteVar?.identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            setShowRemoteWizard(true)
            setSelectedVar(varFile)
            setSelectedVarIndex(index)
            setIsEditMode(true)
          }}
        />
      </div>
    )
  }

  const inlineRender = (varFile: TerraformVarFileWrapper, index: number) => {
    const inlineVar = varFile?.varFile as any
    return (
      <div className={css.configField} data-name={`edit-inline-${index}`}>
        <Layout.Horizontal>
          {inlineVar?.type === getString('inline') && <Icon name="Inline" className={css.iconPosition} />}
          <Text className={css.branch}>{inlineVar?.identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            setShowTfModal(true)
            setIsEditMode(true)
            setSelectedVarIndex(index)
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
  /* istanbul ignore next */
  const onDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])
  /* istanbul ignore next */
  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])
  /* istanbul ignore next */
  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])
  /* istanbul ignore next */
  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])
  /* istanbul ignore next */
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

  const onCloseOfRemoteWizard = () => {
    setShowRemoteWizard(false)
    setIsEditMode(false)
    setSelectedVar(remoteInitialValues)
  }

  const onCloseOfInlineVarForm = () => {
    setShowTfModal(false)
    setIsEditMode(false)
    setSelectedVar(inlineInitValues)
  }

  return (
    <Layout.Vertical>
      <Label style={{ color: Color.GREY_900 }} className={css.tfVarLabel}>
        {getString('optionalField', { name: getString('cd.terraformVarFiles') })}
      </Label>
      <div className={cx(stepCss.formGroup, css.tfVarMargin)}>
        <FieldArray
          name="spec.configuration.varFiles"
          render={arrayHelpers => {
            return (
              <div>
                {formik?.values?.spec?.configuration?.varFiles?.map((varFile: TerraformVarFileWrapper, i) => {
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
                        {(formik.values.spec?.configuration?.varFiles || [])?.length > 1 && (
                          <Text color={Color.BLACK}>{`${i + 1}.`}</Text>
                        )}
                        {varFile?.varFile?.type === TerraformStoreTypes.Remote && remoteRender(varFile, i)}
                        {varFile?.varFile?.type === TerraformStoreTypes.Inline && inlineRender(varFile, i)}
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
                  <Button
                    icon="plus"
                    minimal
                    intent="primary"
                    data-testid="add-tfvar-file"
                    className={css.addTfVarFile}
                  >
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
                          onSubmitCallBack={(values: RemoteVar) => {
                            if (isEditMode) {
                              arrayHelpers.replace(selectedVarIndex, values)
                            } else {
                              arrayHelpers.push(values)
                            }
                            onCloseOfRemoteWizard()
                          }}
                          isEditMode={isEditMode}
                          // initialValues={remoteInitialValues}
                          isReadonly={isReadonly}
                        />
                      </StepWizard>
                    </div>
                    <Button
                      minimal
                      icon="cross"
                      iconProps={{ size: 18 }}
                      onClick={() => {
                        onCloseOfRemoteWizard()
                      }}
                      className={css.crossIcon}
                    />
                  </Dialog>
                )}
                {showTfModal && (
                  <InlineVarFile
                    arrayHelpers={arrayHelpers}
                    isEditMode={isEditMode}
                    selectedVarIndex={selectedVarIndex}
                    showTfModal={showTfModal}
                    selectedVar={selectedVar}
                    onClose={() => {
                      onCloseOfInlineVarForm()
                    }}
                    onSubmit={() => {
                      onCloseOfInlineVarForm()
                    }}
                    isReadonly={isReadonly}
                  />
                )}
              </div>
            )
          }}
        />
      </div>
    </Layout.Vertical>
  )
}
