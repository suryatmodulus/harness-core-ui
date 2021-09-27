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
  replaceTriggerDefaultBuild,
  updatePipelineArtifact,
  updatePipelineManifest
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

  const getSelectedArtifactId = () => {
    if (selectedArtifactId) {
      return selectedArtifactId
    } else if (values?.selectedArtifact && !values?.selectedArtifact?.identifier) {
      return 'primary'
    }
  }
  const formDetails = TriggerFactory.getTriggerFormDetails(TriggerFormType.Manifest)
  const ManifestFormDetails = formDetails.component
  const artifactForm = TriggerFactory.getTriggerFormDetails(TriggerFormType.Artifact)
  const ArtifactFormDetails = artifactForm.component
  const filteredArtifact = filterArtifact({
    runtimeData,
    stageId: selectedStageId,
    artifactId: getSelectedArtifactId(),
    isManifest
  })

  const templateObject = isManifest ? getTemplateObject(filteredArtifact, []) : getTemplateObject([], filteredArtifact)
  const artifactOrManifestText = isManifest
    ? getString('manifestsText')
    : getString('pipeline.triggers.artifactTriggerConfigPanel.artifact')

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
            {isManifest && (
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
            )}

            {!isManifest && (
              <ArtifactFormDetails
                template={templateObject}
                path={getPathString(runtimeData, selectedStageId)}
                allValues={templateObject}
                initialValues={runtimeData}
                readonly={false}
                stageIdentifier={selectedStageId}
                formik={formikProps}
                fromTrigger={true}
              />
            )}
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
                const getArtifactId = () => {
                  if (isManifest || selectedArtifactId) {
                    return selectedArtifactId
                  } else if (!isManifest) {
                    return 'primary'
                  }
                }
                const orginalArtifact = filterArtifact({
                  runtimeData: formikProps.values.originalPipeline?.stages,
                  stageId: selectedStageId,
                  artifactId: getArtifactId(),
                  isManifest
                })

                const getManifests = () => {
                  return filterFormStages && filterFormStages.length
                    ? filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests[0]
                    : {}
                }

                const getArtifacts = () => {
                  if (!filterFormStages) {
                    return {}
                  }
                  if (
                    filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.sidecars
                      ?.length
                  ) {
                    return filterFormStages && filterFormStages.length
                      ? filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.sidecars[0]
                      : {}
                  } else if (
                    filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.primary
                  ) {
                    return filterFormStages[0]?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts?.primary
                  }
                }

                /*
                                                        when we have multiple stages - need to filter undefined values
                                                        in this case formikprops.values.stages will be [undefined, [stage obj]]
                                                        when chartVersion alone is runtime input, stages array could be empty
                                              */
                const filterFormStages = formikProps.values?.stages?.filter((item: any) => item)
                // when stages is empty array, filteredArtifact will be empty object
                const formFilteredArtifact = isManifest ? getManifests() : getArtifacts()

                const mergeArtifact = () => {
                  if (isManifest) {
                    return merge({}, orginalArtifact, formFilteredArtifact)?.['manifest']
                  } else if (!isManifest) {
                    if (orginalArtifact?.sidecars?.length && orginalArtifact?.sidecars[0]?.sidecar) {
                      return merge({}, orginalArtifact?.sidecars[0]?.sidecar, formFilteredArtifact?.sidecar)
                    } else if (orginalArtifact?.primary) {
                      return merge({}, orginalArtifact.primary, formFilteredArtifact)
                    }
                  }
                }

                const finalArtifact = mergeArtifact()
                if (finalArtifact?.spec?.chartVersion && isManifest) {
                  // hardcode manifest chart version to default
                  finalArtifact.spec.chartVersion = replaceTriggerDefaultBuild({
                    chartVersion: finalArtifact.spec.chartVersion
                  })
                } else if (!isManifest && finalArtifact?.spec?.tag) {
                  finalArtifact.spec.tag = replaceTriggerDefaultBuild({
                    build: finalArtifact?.spec?.tag
                  })
                }
                const { pipeline, selectedArtifact } = formikProps.values
                const newPipelineObj = isManifest
                  ? updatePipelineManifest({
                      pipeline,
                      stageIdentifier: selectedStageId,
                      selectedArtifact,
                      newArtifact: clearRuntimeInputValue(finalArtifact)
                    })
                  : updatePipelineArtifact({
                      pipeline,
                      stageIdentifier: selectedStageId,
                      selectedArtifact,
                      newArtifact: clearRuntimeInputValue(finalArtifact)
                    })

                formikProps.setValues({
                  ...formikProps.values,
                  pipeline: newPipelineObj,
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
