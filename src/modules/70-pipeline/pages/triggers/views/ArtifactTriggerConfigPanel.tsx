import React, { useState, useEffect } from 'react'
import { Layout, Text, Label, Container, Color, HarnessDocTooltip } from '@wings-software/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useStrings } from 'framework/strings'
import { SelectArtifactModal } from './modals'
import ArtifactTableInfo from './subviews/ArtifactTableInfo'
import {
  parseArtifactsManifests,
  getArtifactTableDataFromData,
  artifactManifestData,
  artifactTableItem,
  getPathString,
  getArtifactSpecObj,
  updatePipelineManifest,
  updatePipelineArtifact,
  getArtifactId
} from '../utils/TriggersWizardPageUtils'
import css from './ArtifactTriggerConfigPanel.module.scss'

export interface ArtifactTriggerConfigPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const artifactStr = 'pipeline.triggers.artifactTriggerConfigPanel.artifact'

const onRemoveSelectedArtifactManifest = ({
  isManifest,
  stageId,
  formikProps
}: {
  isManifest: boolean
  stageId: string
  formikProps: any
}) => {
  const { pipeline } = formikProps.values
  const newPipelineObj = isManifest
    ? updatePipelineManifest({
        pipeline,
        stageIdentifier: stageId,
        selectedArtifact: formikProps?.values?.selectedArtifact,
        newArtifact: {}
      })
    : updatePipelineArtifact({
        pipeline,
        stageIdentifier: stageId,
        selectedArtifact: formikProps?.values?.selectedArtifact,
        newArtifact: {}
      })
  formikProps.setValues({
    ...formikProps.values,
    pipeline: newPipelineObj,
    selectedArtifact: undefined,
    stageId: undefined,
    stages: undefined // clears all artifact runtime inputs
  })
  formikProps.setFieldTouched('selectedArtifact')
}

const onEdit = ({
  appliedArtifact,
  selectedArtifact,
  initialPath,
  isManifest,
  formikProps
}: {
  appliedArtifact: any
  selectedArtifact: any
  initialPath: string
  isManifest: boolean
  formikProps: any
}) => {
  const newAppliedArtifactSpecObj = getArtifactSpecObj({
    appliedArtifact,
    selectedArtifact,
    path: '',
    isManifest
  })
  if (isManifest) {
    formikProps.setFieldValue(`${initialPath}.manifests[0].manifest.spec`, newAppliedArtifactSpecObj)
  } else {
    if (appliedArtifact?.sidecar) {
      formikProps.setFieldValue(`${initialPath}.artifacts.sidecars[0].sidecar`, newAppliedArtifactSpecObj)
    } else {
      formikProps.setFieldValue(`${initialPath}.artifacts.primary`, newAppliedArtifactSpecObj)
    }
  }
}

const showAppliedTableArtifact = ({
  formikProps,
  appliedTableArtifact,
  isManifest,
  editModalOpen,
  setEditModalOpen,
  data,
  stageId
}: {
  formikProps: any
  appliedTableArtifact: any
  isManifest: boolean
  editModalOpen: boolean
  setEditModalOpen: any
  data: any
  stageId: string
}) => {
  return (
    <Container style={{ display: 'inline-block', width: '100%' }}>
      <ArtifactTableInfo
        formikProps={formikProps}
        appliedArtifact={appliedTableArtifact}
        isManifest={isManifest}
        editArtifact={() => setEditModalOpen(true)}
        removeArtifact={() =>
          onRemoveSelectedArtifactManifest({
            isManifest,
            formikProps,
            stageId
          })
        }
      />
      {editModalOpen && (
        <SelectArtifactModal
          isModalOpen={editModalOpen}
          formikProps={formikProps}
          closeModal={() => setEditModalOpen(false)}
          isManifest={isManifest}
          runtimeData={data}
        />
      )}
    </Container>
  )
}

const showAddArtifactManifest = ({
  isManifest,
  getString,
  allowSelectArtifact,
  setModalOpen,
  formikProps,
  modalOpen,
  artifactTableData,
  data
}: {
  isManifest: boolean
  getString: any
  allowSelectArtifact: boolean
  setModalOpen: any
  formikProps: any
  modalOpen: any
  artifactTableData: any
  data: any
}): JSX.Element => {
  const artifactOrManifestText = isManifest ? getString('manifestsText') : getString(artifactStr)
  return (
    <>
      <Label
        style={{
          fontSize: 13,
          color: 'var(--form-label)',
          fontWeight: 'normal',
          marginBottom: 'var(--spacing-small)'
        }}
        data-tooltip-id="artifactManifestLabel"
      >
        {isManifest ? getString('manifestsText') : getString(artifactStr)}
      </Label>
      <HarnessDocTooltip tooltipId="artifactManifestLabel" useStandAlone={true} />
      <Text
        data-name="plusAdd"
        style={{
          cursor: allowSelectArtifact ? 'pointer' : 'not-allowed',
          color: allowSelectArtifact ? 'var(--primary-7)' : 'var(--form-label)',
          width: '130px'
        }}
        onClick={() => {
          if (allowSelectArtifact) {
            setModalOpen(true)
            formikProps.setFieldTouched('selectedArtifact')
          }
        }}
      >
        {getString('pipeline.triggers.artifactTriggerConfigPanel.plusSelect', {
          artifact: artifactOrManifestText
        })}
      </Text>
      {allowSelectArtifact && (
        <SelectArtifactModal
          isModalOpen={modalOpen}
          formikProps={formikProps}
          artifactTableData={artifactTableData}
          closeModal={() => setModalOpen(false)}
          isManifest={isManifest}
          runtimeData={data}
        />
      )}
    </>
  )
}

const ArtifactTriggerConfigPanel: React.FC<ArtifactTriggerConfigPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}) => {
  const { artifactType, manifestType, stageId, inputSetTemplateYamlObj, originalPipeline, selectedArtifact } =
    formikProps.values
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
  const [parsedArtifactsManifests, setParsedArtifactsManifests] = useState<{
    appliedArtifact?: artifactManifestData
    data?: artifactManifestData[]
  }>({})
  // appliedArtifact is saved on the trigger or in formikValues vs. selectedArtifact is in the modal
  const [appliedTableArtifact, setAppliedTableArtifact] = useState<artifactTableItem[] | undefined>(undefined)
  const [artifactTableData, setArtifactTableData] = useState<artifactTableItem[] | undefined>(undefined)
  const { appliedArtifact, data } = parsedArtifactsManifests
  const { getString } = useStrings()
  const isManifest = !!manifestType
  const initialPath = data && stageId && getPathString(data, stageId)
  useEffect(() => {
    if (
      !formikProps.values?.stages &&
      initialPath &&
      appliedArtifact &&
      Object.entries(appliedArtifact).length &&
      selectedArtifact
    ) {
      // sets stages which is required to edit runtime input of selected artifact
      // when onEdit or from yaml switch
      onEdit({ appliedArtifact, selectedArtifact, initialPath, isManifest, formikProps })
    }
  }, [initialPath, appliedTableArtifact])

  useEffect(() => {
    if (inputSetTemplateYamlObj || selectedArtifact) {
      const res = parseArtifactsManifests({
        inputSetTemplateYamlObj,
        manifestType,
        stageId,
        artifactType,
        artifactRef: getArtifactId(isManifest, selectedArtifact?.identifier), // artifactRef will represent artifact or manifest
        isManifest
      })
      setParsedArtifactsManifests(res)
    }
  }, [inputSetTemplateYamlObj, selectedArtifact])

  useEffect(() => {
    if (!selectedArtifact) {
      setAppliedTableArtifact(undefined)
    }
    if ((appliedArtifact || data) && originalPipeline) {
      const { appliedTableArtifact: newAppliedTableArtifact, artifactTableData: newArtifactTableData } =
        getArtifactTableDataFromData({
          data,
          isManifest,
          appliedArtifact,
          stageId,
          getString,
          artifactType,
          pipeline: originalPipeline
        })
      if (newAppliedTableArtifact) {
        setAppliedTableArtifact(newAppliedTableArtifact)
      } else if (newArtifactTableData) {
        setArtifactTableData(newArtifactTableData)
      }
    }
  }, [appliedArtifact, data, originalPipeline, selectedArtifact])

  const loading = false
  const allowSelectArtifact = !!data?.length
  const artifactOrManifestText = isManifest ? getString('manifestsText') : getString(artifactStr)
  const { errors } = formikProps
  return (
    <Layout.Vertical className={css.artifactTriggerConfigContainer} padding="xxlarge">
      {loading && (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
      <Text className={css.formContentTitle} inline={true} data-tooltip-id="artifactManifestLabel">
        {getString('pipeline.triggers.triggerConfigurationLabel')}
        {!isEdit
          ? `: ${getString('pipeline.triggers.onNewArtifactTitle', {
              artifact: artifactOrManifestText
            })}`
          : ''}
      </Text>
      <HarnessDocTooltip tooltipId="artifactManifestLabel" useStandAlone={true} />
      <div className={css.formContent}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
          tooltipProps={{
            dataTooltipId: 'artifactTrigger'
          }}
        />
      </div>
      <Text className={css.formContentTitle} inline={true} data-tooltip-id="listenOnNewArtifactManifest">
        {getString('pipeline.triggers.artifactTriggerConfigPanel.listenOnNewArtifact', {
          artifact: artifactOrManifestText
        })}
      </Text>
      <HarnessDocTooltip tooltipId="listenOnNewArtifactManifest" useStandAlone={true} />
      <div className={css.formContent}>
        {appliedTableArtifact ? (
          showAppliedTableArtifact({
            formikProps,
            appliedTableArtifact,
            isManifest,
            editModalOpen,
            setEditModalOpen,
            data,
            stageId
          })
        ) : (
          <>
            {showAddArtifactManifest({
              isManifest,
              getString,
              allowSelectArtifact,
              setModalOpen,
              formikProps,
              modalOpen,
              artifactTableData,
              data
            })}
            {(formikProps.touched['selectedArtifact'] || formikProps.submitCount > 0) &&
              !modalOpen &&
              errors['selectedArtifact'] && (
                <Text color={Color.RED_500} style={{ marginBottom: 'var(--spacing-medium)' }}>
                  {errors['selectedArtifact']}
                </Text>
              )}
          </>
        )}
        {inputSetTemplateYamlObj && !appliedArtifact && !allowSelectArtifact && (
          <Text margin="small" intent="warning">
            {getString('pipeline.triggers.artifactTriggerConfigPanel.noSelectableArtifactsFound', {
              artifact: artifactOrManifestText
            })}
          </Text>
        )}
      </div>
    </Layout.Vertical>
  )
}
export default ArtifactTriggerConfigPanel
