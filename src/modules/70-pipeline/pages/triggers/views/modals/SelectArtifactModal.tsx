import React, { useState } from 'react'
import { Layout, Text, Button } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import ArtifactTableInfo from '../subviews/ArtifactTableInfo'
import css from './SelectArtifactModal.module.scss'

interface SelectArtifactModalPropsInterface {
  isModalOpen: boolean
  data: any
  formikProps: any
  closeModal: () => void
}

const SelectArtifactModal: React.FC<SelectArtifactModalPropsInterface> = ({
  isModalOpen,
  formikProps,
  closeModal,
  data
}) => {
  const [selectedArtifact, setSelectedArtifact] = useState(undefined)
  const { getString } = useStrings()

  const closeAndReset = () => {
    closeModal()
    setSelectedArtifact(undefined)
  }

  return (
    <Dialog
      className={`${css.selectArtifactModal} padded-dialog`}
      isOpen={isModalOpen}
      enforceFocus={false}
      title={getString('pipeline.triggers.artifactTriggerConfigPanel.selectAnArtifact')}
      onClose={closeAndReset}
      //   onClose={() => setModalOpen(false)}
    >
      <ArtifactTableInfo
        setSelectedArtifact={setSelectedArtifact}
        selectedArtifact={selectedArtifact}
        formikProps={formikProps}
        data={data}
      />
      <Layout.Horizontal spacing="medium" className={css.footer}>
        <Button
          text={getString('select')}
          intent="primary"
          onClick={() => {
            formikProps.setFieldValue('artifact', selectedArtifact)
            closeModal()
          }}
        />
        <Text className={css.cancel} onClick={closeAndReset}>
          {getString('cancel')}
        </Text>
      </Layout.Horizontal>
    </Dialog>
  )
}

export default SelectArtifactModal
