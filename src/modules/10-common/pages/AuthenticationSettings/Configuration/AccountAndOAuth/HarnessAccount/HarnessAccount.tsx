import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { Color, Layout, Card, Switch, Collapse } from '@wings-software/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useStrings } from 'framework/exports'
import { useToaster } from '@common/components'
import { AuthenticationMechanisms } from '@common/constants/Utils'
import { useUpdateAuthMechanism } from 'services/cd-ng'
import type { AuthenticationSettingsResponse, UsernamePasswordSettings } from 'services/cd-ng'
import PasswordStrength from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/PasswordStrength/PasswordStrength'
import PasswordExpire from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/PasswordExpire/PasswordExpire'
import LockoutPolicy from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/LockoutPolicy/LockoutPolicy'
import cssConfiguration from '@common/pages/AuthenticationSettings/Configuration/Configuration.module.scss'
import css from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount.module.scss'

interface Props {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
}

interface DetailsProps {
  authSettings: AuthenticationSettingsResponse
  refetchAuthSettings: () => void
}

const Details: React.FC<DetailsProps> = ({ authSettings, refetchAuthSettings }) => {
  const { getString } = useStrings()

  const userPasswordSettings = authSettings.ngAuthSettings?.find(
    ({ settingsType }) => settingsType === AuthenticationMechanisms.USER_PASSWORD
  ) as UsernamePasswordSettings

  const loginSettings = userPasswordSettings.loginSettings

  return (
    <Layout.Vertical spacing="medium">
      <PasswordStrength loginSettings={loginSettings} refetchAuthSettings={refetchAuthSettings} />
      <PasswordExpire loginSettings={loginSettings} refetchAuthSettings={refetchAuthSettings} />
      <LockoutPolicy loginSettings={loginSettings} refetchAuthSettings={refetchAuthSettings} />
      <Card className={css.twoFactorAuthentication}>
        <Switch
          label={getString('common.authSettings.enforceTwoFA')}
          checked={authSettings.twoFactorEnabled}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          onChange={noop}
        />
      </Card>
    </Layout.Vertical>
  )
}

const HarnessAccount: React.FC<Props> = ({ authSettings, refetchAuthSettings }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showWarning, showSuccess, showError } = useToaster()
  const userPasswordAuthMechanismEnabled =
    authSettings.authenticationMechanism === AuthenticationMechanisms.USER_PASSWORD
  const oauthEnabled = !!authSettings.ngAuthSettings?.find(
    settings => settings.settingsType === AuthenticationMechanisms.OAUTH
  )

  const { mutate: updateAuthMechanism, loading: updatingAuthMechanism } = useUpdateAuthMechanism({})

  const submitUserPasswordUpdate = async (
    authenticationMechanism: keyof typeof AuthenticationMechanisms,
    message?: string
  ): Promise<void> => {
    try {
      const response = await updateAuthMechanism(undefined, {
        queryParams: {
          accountIdentifier: accountId,
          authenticationMechanism: authenticationMechanism
        }
      })

      /* istanbul ignore else */ if (response) {
        refetchAuthSettings()
        showSuccess(message, 5000)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
    }
  }

  const { openDialog: confirmUserPasswordDisable } = useConfirmationDialog({
    cancelButtonText: getString('common.cancel'),
    titleText: getString('common.authSettings.disableUserPasswordLogin'),
    contentText: getString('common.authSettings.confirmDisableUserPasswordLogin'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: async isConfirmed => {
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
      showWarning(getString('common.authSettings.enableAtLeastOneSSoBeforeDisablingUserPasswordLogin'))
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
      collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName)}
      collapseClassName={cssConfiguration.collapseClassName}
      collapsedIcon="main-chevron-down"
      expandedIcon="main-chevron-up"
      heading={
        <Switch
          label={getString('common.authSettings.useHarnessUsernameAndPassword')}
          checked={userPasswordAuthMechanismEnabled}
          onChange={toggleUsernamePassword}
          disabled={updatingAuthMechanism}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          data-testid="toggle-user-password-login"
        />
      }
    >
      {userPasswordAuthMechanismEnabled && (
        <Details authSettings={authSettings} refetchAuthSettings={refetchAuthSettings} />
      )}
    </Collapse>
  )
}

export default HarnessAccount
