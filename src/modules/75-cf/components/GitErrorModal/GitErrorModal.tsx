import React, { ReactElement } from 'react'
import {
  ButtonVariation,
  Dialog,
  Layout,
  Button,
  FontVariation,
  Heading,
  Icon,
  Text,
  Color
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

export interface GitErrorModalProps {
  onSubmit: () => void
  onClose: () => void
  apiError: string
}

const GitErrorModal = ({ onSubmit, onClose, apiError }: GitErrorModalProps): ReactElement => {
  const { getString } = useStrings()

  const Title = (): ReactElement => (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Icon size={30} name="warning-sign" color={Color.RED_600} />
      <Heading level={3} font={{ variation: FontVariation.H4 }}>
        {getString('cf.gitSync.gitErrorModalTitle')}
      </Heading>
    </Layout.Horizontal>
  )

  const Footer = (): ReactElement => (
    <Layout.Horizontal spacing="small">
      <Button
        text={getString('cf.gitSync.turnOffGitAndContinue')}
        variation={ButtonVariation.PRIMARY}
        onClick={event => {
          event.preventDefault()
          onSubmit()
        }}
      />
      <Button
        text={getString('cancel')}
        variation={ButtonVariation.TERTIARY}
        onClick={event => {
          event.preventDefault()
          onClose()
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <Dialog enforceFocus={false} isOpen={true} onClose={onClose} title={<Title />} footer={<Footer />}>
      <Layout.Vertical
        spacing="large"
        data-testid="git-error-modal"
        margin={{ bottom: 'huge' }}
        padding={{ bottom: 'medium' }}
      >
        <Text>{apiError}</Text>
        <Text>{getString('cf.gitSync.gitServiceApiError')}</Text>
      </Layout.Vertical>
    </Dialog>
  )
}

export default GitErrorModal
