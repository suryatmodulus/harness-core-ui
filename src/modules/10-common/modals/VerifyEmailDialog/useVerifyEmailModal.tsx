import React from 'react'
import { useModalHook, Button, Layout, Text, Color, Container } from '@wings-software/uicore'
import cx from 'classnames'
import { Dialog, Classes } from '@blueprintjs/core'
import { useResendEmail } from 'services/portal'
import { useToaster } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'

import css from './useVerifyEmailModal.module.scss'

interface UseEmailVerifyModalProps {
  onCloseModal?: () => void
}

export interface UseEmailVerifyModalReturn {
  openEmailVerifyModal: () => void
  closeEmailVerifyModal: () => void
}

const VerifyEmail: React.FC<UseEmailVerifyModalProps> = ({ onCloseModal }) => {
  const { getString } = useStrings()
  const { currentUserInfo } = useAppStore()

  const { mutate: resendEmail, loading } = useResendEmail({
    uuid: currentUserInfo.uuid || '',
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })

  const { showError, showSuccess } = useToaster()

  const handleResendEmail = async (): Promise<void> => {
    try {
      await resendEmail()
      showSuccess(getString('common.banners.trial.verifyEmail.resendSuccess'))
      onCloseModal?.()
    } catch (error) {
      showError(error.data?.message)
    }
  }
  return (
    <Container>
      <Layout.Vertical padding={{ bottom: 'huge' }} spacing={'small'}>
        <Text font={{ size: 'large', weight: 'bold' }} color={Color.BLACK}>
          {getString('common.banners.trial.verifyEmail.title')}
        </Text>
        <Text icon="deployment-incomplete-new" iconProps={{ size: 18 }}>
          {getString('common.banners.trial.verifyEmail.subtitle')}
        </Text>
      </Layout.Vertical>
      <Text padding={{ bottom: 'xlarge' }} className={css.description} width="92%">
        {getString('common.banners.trial.verifyEmail.description')}
      </Text>
      <Text padding={{ bottom: 'xsmall' }}> {getString('common.banners.trial.verifyEmail.emailAddress')}</Text>
      <Text background={Color.GREY_200} border={{ radius: 4 }} height={35} width="92%" padding={'small'}>
        {currentUserInfo.email}
      </Text>
      <Layout.Horizontal padding={{ top: 'huge' }} spacing={'small'}>
        <Button
          intent="primary"
          text={getString('common.banners.trial.verifyEmail.resend')}
          type="submit"
          disabled={loading}
          onClick={handleResendEmail}
        />
      </Layout.Horizontal>
    </Container>
  )
}

export const useVerifyEmailModal = (props: UseEmailVerifyModalProps): UseEmailVerifyModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        onClose={() => {
          hideModal(), props.onCloseModal?.()
        }}
        className={cx(css.dialog, Classes.DIALOG, css.verifyEmail)}
      >
        <VerifyEmail
          onCloseModal={() => {
            hideModal(), props.onCloseModal?.()
          }}
        />
        <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal(), props.onCloseModal?.()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    []
  )

  return {
    openEmailVerifyModal: showModal,
    closeEmailVerifyModal: hideModal
  }
}
