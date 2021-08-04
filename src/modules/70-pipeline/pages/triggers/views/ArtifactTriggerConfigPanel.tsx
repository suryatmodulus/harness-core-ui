import React, { useState, useEffect } from 'react'
import { Layout, Heading, Text, Label, Button, Container } from '@wings-software/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useStrings } from 'framework/strings'
import { SelectArtifactModal } from './modals'
import ArtifactTableInfo from './subviews/ArtifactTableInfo'
import {
  parseArtifactsManifests,
  getArtifactTableDataFromData,
  artifactManifestData,
  artifactTableItem
} from '../utils/TriggersWizardPageUtils'
import css from './ArtifactTriggerConfigPanel.module.scss'

export interface ArtifactTriggerConfigPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const ArtifactTriggerConfigPanel: React.FC<ArtifactTriggerConfigPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}) => {
  const { artifactType, artifactRef, manifestType, stageId, inputSetTemplateYamlObj, originalPipeline } =
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

  useEffect(() => {
    if (inputSetTemplateYamlObj) {
      const res = parseArtifactsManifests({
        inputSetTemplateYamlObj,
        manifestType,
        stageId,
        artifactType,
        artifactRef,
        isManifest
      })
      setParsedArtifactsManifests(res)
    }
  }, [inputSetTemplateYamlObj])

  useEffect(() => {
    if ((appliedArtifact || data) && originalPipeline) {
      const { appliedTableArtifact: newAppliedTableArtifact, artifactTableData: newArtifactTableData } =
        getArtifactTableDataFromData({
          data,
          isManifest,
          appliedArtifact,
          stageId,
          getString,
          pipeline: originalPipeline
        })
      if (newAppliedTableArtifact) {
        setAppliedTableArtifact(newAppliedTableArtifact)
      } else if (newArtifactTableData) {
        setArtifactTableData(newArtifactTableData)
      }
    }
  }, [appliedArtifact, data, originalPipeline])

  const loading = false
  const allowSelectArtifact = data?.length
  const artifactOrManifestText = isManifest
    ? getString('manifestsText')
    : getString('pipeline.triggers.artifactTriggerConfigPanel.artifact')

  return (
    <Layout.Vertical className={css.artifactTriggerConfigContainer} padding="xxlarge">
      {loading && (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
      <h2 className={css.heading}>{`${getString('pipeline.triggers.triggerConfigurationLabel')}${
        !isEdit
          ? `: ${getString('pipeline.triggers.onNewArtifactTitle', {
              artifact: artifactOrManifestText
            })}`
          : ''
      }`}</h2>
      <div style={{ backgroundColor: 'var(--white)' }}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
        />
        <Heading className={css.listenOnNewWebhook} style={{ marginTop: '0!important' }} level={2}>
          {getString('pipeline.triggers.artifactTriggerConfigPanel.listenOnNewArtifact', {
            artifact: artifactOrManifestText
          })}
        </Heading>
        <section style={{ marginTop: 'var(--spacing-small)' }}>
          {appliedTableArtifact ? (
            <Container style={{ display: 'inline-block', width: '100%' }}>
              <ArtifactTableInfo
                formikProps={formikProps}
                appliedArtifact={appliedTableArtifact}
                isManifest={isManifest}
                editArtifact={() => setEditModalOpen(true)}
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
              <Button
                style={{ display: 'inline-block', color: '' }}
                minimal
                data-name="main-delete"
                icon="main-trash"
                onClick={_ => {
                  formikProps.setValues({ ...formikProps.values, artifactRef: undefined, stageId: undefined }) // need to clear all artifact runtime inputs
                }}
              />
            </Container>
          ) : (
            <>
              <Label
                style={{
                  fontSize: 13,
                  color: 'var(--form-label)',
                  fontWeight: 'normal',
                  marginBottom: 'var(--spacing-small)'
                }}
              >
                {isManifest
                  ? getString('manifestsText')
                  : getString('pipeline.triggers.artifactTriggerConfigPanel.artifact')}
              </Label>
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
          )}
          {inputSetTemplateYamlObj && !appliedArtifact && !allowSelectArtifact && (
            <Text margin="small" intent="warning">
              {getString('pipeline.triggers.artifactTriggerConfigPanel.noSelectableArtifactsFound')}
            </Text>
          )}
        </section>
      </div>
    </Layout.Vertical>
  )
}
export default ArtifactTriggerConfigPanel
