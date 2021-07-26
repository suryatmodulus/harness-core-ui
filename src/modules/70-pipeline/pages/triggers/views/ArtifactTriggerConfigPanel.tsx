import React, { useState } from 'react'
import { Layout, Heading, Text, Label, Button, Container } from '@wings-software/uicore'
import { NameIdDescriptionTags } from '@common/components'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useStrings } from 'framework/strings'
import { SelectArtifactModal } from './modals'
import ArtifactTableInfo from './subviews/ArtifactTableInfo'
import css from './ArtifactTriggerConfigPanel.module.scss'

export interface ArtifactTriggerConfigPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const data = [
  {
    artifactId: 'artifactId1',
    name: 'artifact1',
    stage: 'Dev',
    service: 'Service A',
    artifactRepository: 'connector name',
    location: './location',
    buildTag: 'build/Tag'
  },
  {
    artifactId: 'artifactId2',
    name: 'artifactId2',
    stage: 'QA',
    service: 'Service A',
    artifactRepository: 'connector name',
    location: './location',
    buildTag: 'build/Tag'
  },
  {
    artifactId: 'artifactId3',
    name: 'artifactId3',
    stage: 'Staging',
    service: 'Service A',
    artifactRepository: 'connector name',
    location: './location',
    buildTag: 'build/Tag'
  },
  {
    artifactId: 'artifactId4',
    name: 'artifactId4',
    stage: 'Prod',
    service: 'Service A',
    artifactRepository: 'connector name',
    location: './location',
    buildTag: 'build/Tag'
  }
]

const ArtifactTriggerConfigPanel: React.FC<ArtifactTriggerConfigPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}) => {
  const { artifact } = formikProps.values
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const { getString } = useStrings()
  const loading = false
  const selectedArtifact = data?.find(d => d.artifactId === artifact)
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
          {selectedArtifact ? (
            <Container style={{ display: 'inline-block', width: '100%' }}>
              <ArtifactTableInfo formikProps={formikProps} readonly={true} data={[selectedArtifact]} />
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
              <Label style={{ fontSize: 13, fontWeight: 'normal', marginBottom: 'var(--spacing-small)' }}>
                {getString('pipeline.triggers.artifactTriggerConfigPanel.artifact')}
              </Label>
              <Text
                data-name="plusAdd"
                intent={allowSelectArtifact ? 'primary' : 'none'}
                style={{ cursor: allowSelectArtifact ? 'pointer' : 'not-allowed', width: '130px' }}
                onClick={() => {
                  if (allowSelectArtifact) {
                    setModalOpen(true)
                  }
                }}
              >
                {getString('pipeline.triggers.artifactTriggerConfigPanel.plusSelectArtifact')}
              </Text>
              <SelectArtifactModal
                isModalOpen={modalOpen}
                formikProps={formikProps}
                data={data}
                closeModal={() => setModalOpen(false)}
              />
            </>
          )}
          {!allowSelectArtifact && (
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
