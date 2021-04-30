import React from 'react'
import { Button, Color, Container, Layout, Text, TextInput } from '@wings-software/uicore'
import QRCode from 'react-qr-code'
import copy from 'copy-to-clipboard'
import { TwoFactorAuthSettingsInfo, useEnableTwoFactorAuth, useGetTwoFactorAuthSettings } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { PageSpinner, useToaster } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from '../useEnableTwoFactorAuthModal.module.scss'

interface EnableTwoFactorAuthViewProps {
  isReset: boolean
  onEnable: () => void
  onCancel: () => void
}

const EnableTwoFactorAuthView: React.FC<EnableTwoFactorAuthViewProps> = ({ isReset, onCancel, onEnable }) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { mutate: enableTwoFactorAuth } = useEnableTwoFactorAuth({})
  const { updateAppStore } = useAppStore()

  const { data, refetch: refetchTwoFactorAuthSettings, loading } = useGetTwoFactorAuthSettings({
    authMechanism: 'TOTP'
  })

  const handleEnableTwoFactorAuth = async (settings?: TwoFactorAuthSettingsInfo): Promise<void> => {
    try {
      const enabled = await enableTwoFactorAuth({
        ...settings,
        twoFactorAuthenticationEnabled: true
      })
      if (enabled) {
        showSuccess(getString('userProfile.twoFactor.enableSuccess'))
        updateAppStore({ currentUserInfo: enabled.data })
        onEnable()
      }
    } catch (e) {
      showError(e.data.message || e.message)
    }
  }

  const authSettings = data?.data
  return (
    <>
      <Layout.Vertical padding="huge">
        <Text color={Color.BLACK} font={{ size: 'large', weight: 'bold' }}>
          {isReset ? getString('userProfile.twoFactor.resetTitle') : getString('userProfile.twoFactor.enableTitle')}
        </Text>
        <Container className={css.view}>
          {authSettings ? (
            <>
              <Layout.Horizontal padding={{ top: 'large', bottom: 'huge' }}>
                <Layout.Vertical>
                  <Text padding={{ bottom: 'large' }} color={Color.BLACK_100}>
                    {getString('userProfile.qrCode')}
                  </Text>
                  <Layout.Horizontal padding="medium" className={css.qrCode}>
                    <QRCode value={authSettings.totpqrurl || ''} />
                  </Layout.Horizontal>
                </Layout.Vertical>
                <Layout.Vertical padding="huge" className={css.description}>
                  <Text color={Color.BLACK}>{getString('userProfile.twoFactor.description')}</Text>
                  <Layout.Vertical spacing="small" padding={{ top: 'large' }}>
                    <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
                      {getString('common.secretKey')}
                    </Text>
                    <TextInput
                      disabled
                      value={authSettings.totpSecretKey}
                      rightElement={
                        (
                          <Button
                            icon="duplicate"
                            inline
                            minimal
                            className={css.clone}
                            onClick={() => {
                              copy(authSettings.totpSecretKey || '')
                                ? showSuccess(getString('clipboardCopySuccess'))
                                : showError(getString('clipboardCopyFail'))
                            }}
                          />
                        ) as any
                      }
                    />
                  </Layout.Vertical>
                </Layout.Vertical>
              </Layout.Horizontal>
              <Layout.Horizontal flex>
                <Layout.Horizontal spacing="small">
                  <Button
                    intent="primary"
                    text={isReset ? getString('save') : getString('enable')}
                    onClick={() => handleEnableTwoFactorAuth(authSettings)}
                  />
                  <Button text={getString('cancel')} onClick={onCancel} />
                </Layout.Horizontal>
                <Button icon="reset" minimal onClick={() => refetchTwoFactorAuthSettings()} />
              </Layout.Horizontal>
            </>
          ) : null}
        </Container>
        {loading ? <PageSpinner /> : null}
      </Layout.Vertical>
    </>
  )
}

export default EnableTwoFactorAuthView
