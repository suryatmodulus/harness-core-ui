import React, { useState } from 'react'
import { Layout, Heading, Text, Label, Button, Container } from '@wings-software/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useStrings } from 'framework/strings'
import { SelectArtifactModal } from './modals'
import ArtifactTableInfo from './subviews/ArtifactTableInfo'
import { parseArtifactsManifests, getArtifactTableDataFromData } from '../utils/TriggersWizardPageUtils'
import css from './ArtifactTriggerConfigPanel.module.scss'

export interface ArtifactTriggerConfigPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const ArtifactTriggerConfigPanel: React.FC<ArtifactTriggerConfigPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}) => {
  const { artifactType, artifactRef, manifestType, stageId, inputSetTemplateYamlObj } = formikProps.values
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const { getString } = useStrings()
  const isManifest = !!manifestType
  // appliedArtifact is saved on the trigger or in formikValues vs. selectedArtifact is in the modal
  const { appliedArtifact, data } = parseArtifactsManifests({
    inputSetTemplateYamlObj,
    manifestType,
    stageId,
    artifactType,
    artifactRef,
    isManifest
  })
  const artifactTableData = getArtifactTableDataFromData({ data, isManifest })
  const loading = false
  const allowSelectArtifact = data?.length
  return (
    <Layout.Vertical className={css.artifactTriggerConfigContainer} padding="xxlarge">
      {loading && (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
      <h2 className={css.heading}>{`${getString('pipeline.triggers.triggerConfigurationLabel')}${
        !isEdit ? `: ${getString('pipeline.triggers.onNewArtifactTitle')}` : ''
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
          {getString('pipeline.triggers.artifactTriggerConfigPanel.listenOnNewArtifact')}
        </Heading>
        <section style={{ marginTop: 'var(--spacing-small)' }}>
          {appliedArtifact ? (
            <Container style={{ display: 'inline-block', width: '100%' }}>
              <ArtifactTableInfo
                formikProps={formikProps}
                readonly={true}
                appliedArtifact={appliedArtifact}
                isManifest={isManifest}
              />
              <Button
                style={{ display: 'inline-block', color: '' }}
                minimal
                data-name="main-delete"
                icon="main-trash"
                onClick={_ => {
                  formikProps.setFieldValue('artifact', undefined)
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
                {getString('pipeline.triggers.artifactTriggerConfigPanel.artifact')}
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
                {getString('pipeline.triggers.artifactTriggerConfigPanel.plusSelectArtifact')}
              </Text>
              {allowSelectArtifact && (
                <SelectArtifactModal
                  isModalOpen={modalOpen}
                  formikProps={formikProps}
                  artifactTableData={artifactTableData}
                  closeModal={() => setModalOpen(false)}
                  isManifest={isManifest}
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
