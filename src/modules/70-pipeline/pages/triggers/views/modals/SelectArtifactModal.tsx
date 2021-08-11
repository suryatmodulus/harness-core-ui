import React, { useState } from 'react'
import { Layout, Text, Button } from '@wings-software/uicore'
import { merge, isEmpty } from 'lodash-es'

import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { TriggerFormType } from '@pipeline/factories/ArtifactTriggerInputFactory/types'
import TriggerFactory from '@pipeline/factories/ArtifactTriggerInputFactory'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'

import ArtifactTableInfo from '../subviews/ArtifactTableInfo'
import {
  clearRuntimeInputValue,
  filterArtifact,
  getPathString,
  getTemplateObject,
  replaceTriggerDefaultBuild
} from '../../utils/TriggersWizardPageUtils'
import css from './SelectArtifactModal.module.scss'

interface SelectArtifactModalPropsInterface {
  isModalOpen: boolean
  isManifest: boolean
  artifactTableData?: any
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
  const { values } = formikProps
  const [selectedArtifactLabel, setSelectedArtifactLabel] = useState(undefined) // artifactLabel is unique
  const [selectedStageId, setSelectedStageId] = useState(values?.stageId)
  const [selectedArtifactId, setSelectedArtifactId] = useState(values?.selectedArtifact?.identifier)
  const [modalState, setModalState] = useState<ModalState>(
    !isEmpty(values?.selectedArtifact) ? ModalState.RUNTIME_INPUT : ModalState.SELECT
  )
  const { getString } = useStrings()

  const closeAndReset = () => {
    closeModal()
    setSelectedArtifactId(undefined)
    setSelectedArtifactLabel(undefined)
    setSelectedStageId(undefined)
    setModalState(!isEmpty(values?.selectedArtifact) ? ModalState.RUNTIME_INPUT : ModalState.SELECT)
    if (isEmpty(values?.selectedArtifact || {}) && values?.stages) {
      // cancelling without applying should clear
      formikProps.setFieldValue('stages', undefined)
    }
  }

  const formDetails = TriggerFactory.getTriggerFormDetails(TriggerFormType.Manifest)
  const ManifestFormDetails = formDetails.component

  const filteredArtifact = filterArtifact({
    runtimeData,
    stageId: selectedStageId,
    artifactId: selectedArtifactId,
    isManifest
  })
  const templateObject = getTemplateObject(filteredArtifact, [])
  const artifactOrManifestText = isManifest
    ? getString('manifestsText')
    : getString('pipeline.triggers.artifactTriggerConfigPanel.artifact')

  // const pathId = getPathString(runtimeData, selectedStage)
  return (
    <Dialog
      className={`${css.selectArtifactModal} padded-dialog`}
      isOpen={isModalOpen}
      enforceFocus={false}
      title={
        modalState === ModalState.SELECT
          ? isManifest
            ? getString('pipeline.triggers.artifactTriggerConfigPanel.selectAManifest')
            : getString('pipeline.triggers.artifactTriggerConfigPanel.selectAnArtifact')
          : getString('pipeline.triggers.artifactTriggerConfigPanel.configureArtifactRuntimeInputs', {
              artifact: artifactOrManifestText
            })
      }
      onClose={closeAndReset}
    >
      {modalState === ModalState.SELECT ? (
        <>
          <ArtifactTableInfo
            setSelectedArtifact={setSelectedArtifactId}
            selectedArtifact={selectedArtifactId}
            setSelectedStage={setSelectedStageId}
            selectedStage={selectedStageId}
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
              disabled={!selectedArtifactId}
              data-name="selectBtn"
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
          <PipelineVariablesContextProvider pipeline={formikProps.values.originalPipeline}>
            <ManifestFormDetails
              template={templateObject}
              path={getPathString(runtimeData, selectedStageId)}
              allValues={templateObject}
              initialValues={runtimeData}
              readonly={false}
              stageIdentifier={selectedStageId}
              formik={formikProps}
              fromTrigger={true}
            />
          </PipelineVariablesContextProvider>
          <Layout.Horizontal spacing="medium" className={css.footer}>
            {!values?.selectedArtifact?.identifier && (
              <Button
                text={getString('back')}
                icon="chevron-left"
                minimal
                onClick={() => {
                  setModalState(ModalState.SELECT)
                }}
              />
            )}
            <Button
              text={getString('filters.apply')}
              intent="primary"
              onClick={() => {
                const orginalArtifact = filterArtifact({
                  runtimeData: formikProps.values.originalPipeline?.stages,
                  stageId: selectedStageId,
                  artifactId: selectedArtifactId,
                  isManifest
                })
                // will it alays be stage index 0 and manifest index 0?

                const formFilteredArtifact =
                  formikProps.values.stages?.[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests[0]
                const finalArtifact = merge({}, orginalArtifact, formFilteredArtifact)?.[
                  isManifest ? 'manifest' : 'artifact'
                ]

                if (finalArtifact?.spec?.chartVersion) {
                  // hardcode manifest chart version to default
                  finalArtifact.spec.chartVersion = replaceTriggerDefaultBuild({
                    chartVersion: finalArtifact.spec.chartVersion
                  })
                }

                formikProps.setValues({
                  ...formikProps.values,
                  selectedArtifact: clearRuntimeInputValue(finalArtifact),
                  stageId: selectedStageId
                })

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
