import React from 'react'
import { Color, Layout, Switch, Collapse } from '@wings-software/uicore'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import { AuthenticationMechanisms } from '@common/constants/Utils'
import type { AuthenticationSettingsResponse, UsernamePasswordSettings } from 'services/cd-ng'
import PasswordStrength from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/PasswordStrength/PasswordStrength'
import PasswordExpire from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/PasswordExpire/PasswordExpire'
import LockoutPolicy from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/LockoutPolicy/LockoutPolicy'
import TwoFactorAuthentication from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/TwoFactorAuthentication/TwoFactorAuthentication'
import cssConfiguration from '@common/pages/AuthenticationSettings/Configuration/Configuration.module.scss'

interface Props {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
  submitUserPasswordUpdate: (
    authenticationMechanism: keyof typeof AuthenticationMechanisms,
    message: string
  ) => Promise<void>
  updatingAuthMechanism: boolean
}

const HarnessAccount: React.FC<Props> = ({
  authSettings,
  refetchAuthSettings,
  submitUserPasswordUpdate,
  updatingAuthMechanism
}) => {
  const { getString } = useStrings()
  const { showWarning } = useToaster()

  const userPasswordAuthMechanismEnabled =
    authSettings.authenticationMechanism === AuthenticationMechanisms.USER_PASSWORD

  const oauthEnabled = !!authSettings.ngAuthSettings?.find(
    settings => settings.settingsType === AuthenticationMechanisms.OAUTH
  )

  const userPasswordSettings = authSettings.ngAuthSettings?.find(
    ({ settingsType }) => settingsType === AuthenticationMechanisms.USER_PASSWORD
  ) as UsernamePasswordSettings | undefined

  const loginSettings = userPasswordSettings?.loginSettings

  const { openDialog: confirmUserPasswordDisable } = useConfirmationDialog({
    titleText: getString('common.authSettings.disableUserPasswordLogin'),
    contentText: getString('common.authSettings.confirmDisableUserPasswordLogin'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        submitUserPasswordUpdate(
          AuthenticationMechanisms.OAUTH,
          getString('common.authSettings.loginSettingsHaveBeenUpdated')
        )
      }
    }
  })

  const toggleUsernamePassword = async (e: React.FormEvent<HTMLInputElement>): Promise<void> => {
    if (userPasswordAuthMechanismEnabled && !oauthEnabled) {
      showWarning(getString('common.authSettings.enableAtLeastOneSsoBeforeDisablingUserPasswordLogin'))
      return
    }

    const enable = e.currentTarget.checked

    if (!enable) {
      confirmUserPasswordDisable()
      return
    }

    submitUserPasswordUpdate(
      AuthenticationMechanisms.USER_PASSWORD,
      getString('common.authSettings.loginSettingsHaveBeenUpdated')
    )
  }

  return (
    <Collapse
      isOpen={userPasswordAuthMechanismEnabled}
      collapseHeaderClassName={cssConfiguration.collapseHeaderClassName}
      collapseClassName={cssConfiguration.collapseClassName}
      collapsedIcon="main-chevron-down"
      expandedIcon="main-chevron-up"
      heading={
        <Switch
          label={getString('common.authSettings.useHarnessUsernameAndPassword')}
          checked={userPasswordAuthMechanismEnabled}
          onChange={toggleUsernamePassword}
          disabled={updatingAuthMechanism || authSettings.authenticationMechanism === AuthenticationMechanisms.SAML}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          data-testid="toggle-user-password-login"
        />
      }
    >
      {loginSettings && (
        <Layout.Vertical spacing="medium">
          <PasswordStrength loginSettings={loginSettings} refetchAuthSettings={refetchAuthSettings} />
          <PasswordExpire loginSettings={loginSettings} refetchAuthSettings={refetchAuthSettings} />
          <LockoutPolicy loginSettings={loginSettings} refetchAuthSettings={refetchAuthSettings} />
          <TwoFactorAuthentication twoFactorEnabled={!!authSettings.twoFactorEnabled} onSuccess={refetchAuthSettings} />
        </Layout.Vertical>
      )}
    </Collapse>
  )
}

export default HarnessAccount
