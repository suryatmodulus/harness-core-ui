import React from 'react'
import { Button, Color, Layout, Text } from '@wings-software/uicore'
import { Switch } from '@blueprintjs/core'
import { useStrings } from 'framework/exports'
import { useDisableTwoFactorAuth } from 'services/cd-ng'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useToaster } from '@common/exports'
import { useEnableTwoFactorAuthModal } from '@user-profile/modals/EnableTwoFactorAuth/useEnableTwoFactorAuthModal'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './TwoFactorAuthentication.module.scss'

const TwoFactorAuthentication: React.FC = () => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { currentUserInfo, updateAppStore } = useAppStore()

  const { mutate: disableTwoFactorAuth } = useDisableTwoFactorAuth({})

  const { openEnableTwoFactorAuthModal } = useEnableTwoFactorAuthModal()

  const { openDialog: disableTwoFactorAuthDialog } = useConfirmationDialog({
    titleText: getString('userProfile.twoFactor.disableTitle'),
    contentText: getString('userProfile.twoFactor.disableText'),
    confirmButtonText: getString('common.disable'),
    cancelButtonText: getString('common.cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const disabled = await disableTwoFactorAuth('' as any, { headers: { 'content-type': 'application/json' } })
          if (disabled) {
            showSuccess(getString('userProfile.twoFactor.disableSuccess'))
            updateAppStore({ currentUserInfo: disabled.data })
          }
        } catch (e) {
          showError(e.data.message || e.message)
        }
      }
    }
  })

  return (
    <>
      <Layout.Horizontal spacing="small" className={css.twoFactorAuth}>
        <Switch
          className={css.switch}
          data-testid={'TwoFactorAuthSwitch'}
          checked={currentUserInfo.twoFactorAuthenticationEnabled}
          onChange={event => {
            if (event.currentTarget.checked) {
              openEnableTwoFactorAuthModal(false)
            } else {
              disableTwoFactorAuthDialog()
            }
          }}
        />
        <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
          {getString('userProfile.twofactorAuth')}
        </Text>
      </Layout.Horizontal>

      {currentUserInfo.twoFactorAuthenticationEnabled ? (
        <Button icon="reset" minimal onClick={() => openEnableTwoFactorAuthModal(true)} />
      ) : null}
    </>
  )
}

export default TwoFactorAuthentication
