import React, { ReactElement } from 'react'
import { ButtonVariation, Container, Layout, Button } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import SaveFlagToGitSubForm from '../SaveFlagToGitSubForm/SaveFlagToGitSubForm'

interface SaveFlagToGitSubFormModalProps {
  title: string
  onSubmit?: () => void
  onClose: () => void
}

const SaveFlagToGitSubFormModal = ({ title, onSubmit, onClose }: SaveFlagToGitSubFormModalProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <Dialog enforceFocus={false} isOpen={true} onClose={onClose} title="">
      <Container id="save-flag-to-git-modal-body" padding={{ bottom: 'xlarge', left: 'xlarge', right: 'xlarge' }}>
        <SaveFlagToGitSubForm title={title} />
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }} padding={{ top: 'xxlarge' }}>
          <Button
            text={getString('save')}
            variation={ButtonVariation.PRIMARY}
            onClick={onSubmit}
            data-testid="save-flag-to-git-modal-save-button"
          />
          <Button
            text={getString('cancel')}
            variation={ButtonVariation.TERTIARY}
            data-testid="save-flag-to-git-modal-cancel-button"
            onClick={event => {
              event.preventDefault()
              onClose()
            }}
          />
        </Layout.Horizontal>
      </Container>
    </Dialog>
  )
}

export default SaveFlagToGitSubFormModal
