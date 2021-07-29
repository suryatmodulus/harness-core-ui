import React, { useState } from 'react'
import { Layout, Text, Button } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { TriggerFormType } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import TriggerFactory from '@pipeline/factories/ArtifactTriggerInputFactory'

import ArtifactTableInfo from '../subviews/ArtifactTableInfo'
import css from './SelectArtifactModal.module.scss'

interface SelectArtifactModalPropsInterface {
  isModalOpen: boolean
  isManifest: boolean
  artifactTableData: any
  formikProps: any
  closeModal: () => void
  runtimeData: any
}

enum ModalState {
  SELECT = 'SELECT',
  RUNTIME_INPUT = 'RUNTIME_INPUT'
}

const SelectArtifactModal: React.FC<SelectArtifactModalPropsInterface> = ({
  isModalOpen,
  formikProps,
  closeModal,
  isManifest,
  artifactTableData,
  runtimeData
}) => {
  const [selectedArtifactLabel, setSelectedArtifactLabel] = useState(undefined) // artifactLabel is unique
  const [selectedStage, setSelectedStage] = useState(undefined)
  const [selectedArtifact, setSelectedArtifact] = useState(undefined)
  const [modalState, setModalState] = useState<ModalState>(ModalState.SELECT)
  const { getString } = useStrings()

  const closeAndReset = () => {
    closeModal()
    setSelectedArtifact(undefined)
  }

  const formDetails = TriggerFactory.getTriggerFormDetails(TriggerFormType.Manifest)
  const ManifestFormDetails = formDetails.component

  return (
    <Dialog
      className={`${css.selectArtifactModal} padded-dialog`}
      isOpen={isModalOpen}
      enforceFocus={false}
      title={
        modalState === ModalState.SELECT
          ? getString('pipeline.triggers.artifactTriggerConfigPanel.selectAnArtifact')
          : getString('pipeline.triggers.artifactTriggerConfigPanel.configureArtifactRuntimeInputs')
      }
      onClose={closeAndReset}
    >
      {modalState === ModalState.SELECT ? (
        <>
          <ArtifactTableInfo
            setSelectedArtifact={setSelectedArtifact}
            selectedArtifact={selectedArtifact}
            setSelectedStage={setSelectedStage}
            selectedStage={selectedStage}
            setSelectedArtifactLabel={setSelectedArtifactLabel}
            selectedArtifactLabel={selectedArtifactLabel}
            isManifest={isManifest}
            formikProps={formikProps}
            artifactTableData={artifactTableData}
          />
          <Layout.Horizontal spacing="medium" className={css.footer}>
            <Button
              text={getString('select')}
              intent="primary"
              disabled={!selectedArtifact}
              onClick={() => {
                setModalState(ModalState.RUNTIME_INPUT)
              }}
            />
            <Text className={css.cancel} onClick={closeAndReset}>
              {getString('cancel')}
            </Text>
          </Layout.Horizontal>
        </>
      ) : (
        <>
          <ManifestFormDetails
            template={runtimeData}
            path={'test'}
            allValues={runtimeData}
            initialValues={runtimeData}
            readonly={false}
            stageIdentifier={artifactTableData?.stageId}
            formik={formikProps}
          />
          <Layout.Horizontal spacing="medium" className={css.footer}>
            <Button
              text={getString('back')}
              icon="chevron-left"
              minimal
              onClick={() => {
                setModalState(ModalState.SELECT)
              }}
            />
            <Button
              text={getString('filters.apply')}
              intent="primary"
              onClick={() => {
                formikProps.setValues({ ...formikProps.values, artifact: selectedArtifact })
                closeModal()
              }}
            />
            <Text className={css.cancel} onClick={closeAndReset}>
              {getString('cancel')}
            </Text>
          </Layout.Horizontal>
        </>
      )}
    </Dialog>
  )
}

export default SelectArtifactModal
