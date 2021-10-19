import React, { ReactElement } from 'react'
import { ButtonVariation, Container, Layout } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import SaveFlagToGitSubForm from '../SaveFlagToGitSubForm/SaveFlagToGitSubForm'
// import SaveFlagRepoDialogForm from './SaveFlagRepoDialogForm'
import css from './SaveFlagToGitModal.module.scss'

interface SaveFlagToGitModalProps {
  title: string
  branch: string //todo move to initial values
  onSubmit: (formData: any) => void // todo
  onClose: () => void
}

const SaveFlagToGitModal = ({
  title,
  branch, //todo move to initial values
  onSubmit,
  onClose
}: SaveFlagToGitModalProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <Dialog enforceFocus={false} isOpen={true} onClose={onClose} title="">
      <Container id="save-flag-to-git-modal-body" className={css.modalBody}>
        <SaveFlagToGitSubForm title={title} branch={branch} />
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }} padding={{ top: 'xxlarge' }}>
          <Button text={getString('save')} variation={ButtonVariation.PRIMARY} type="submit" onClick={onSubmit} />
          <Button
            text={getString('cancel')}
            variation={ButtonVariation.TERTIARY}
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

export default SaveFlagToGitModal
