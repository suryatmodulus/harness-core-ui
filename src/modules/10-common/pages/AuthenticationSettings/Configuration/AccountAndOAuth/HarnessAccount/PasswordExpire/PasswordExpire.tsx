import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Layout, Icon, Text, Color, Container, Switch, Collapse } from '@wings-software/uicore'
import type { LoginSettings } from 'services/cd-ng'
import { usePasswordExpirationModal } from '@common/modals/PasswordExpiration/usePasswordExpiration'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { usePutLoginSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import cssConfiguration from '@common/pages/AuthenticationSettings/Configuration/Configuration.module.scss'
import cssHarnessAccount from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount.module.scss'

interface Props {
  loginSettings: LoginSettings
  refetchAuthSettings: () => void
}

const PasswordExpire: React.FC<Props> = ({ loginSettings, refetchAuthSettings }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const passwordExpirationSettings = loginSettings.passwordExpirationPolicy

  const onSuccess = (): void => {
    refetchAuthSettings()
  }

  const { openPasswordExpirationModal } = usePasswordExpirationModal({
    onSuccess,
    loginSettings
  })

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { openDialog: confirmPasswordExpirySettings } = useConfirmationDialog({
    titleText: getString('common.authSettings.disablePasswordExpiration'),
    contentText: getString('common.authSettings.confirmDisablePasswordExpiration'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const response = await updateLoginSettings({
            ...loginSettings,
            passwordExpirationPolicy: {
              ...passwordExpirationSettings,
              enabled: false
            }
          })

          /* istanbul ignore else */ if (response) {
            refetchAuthSettings()
            showSuccess(getString('common.authSettings.passwordExpirationDisabled'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
        }
      }
    }
  })

  const onChangePasswordExpiry = (e: React.FormEvent<HTMLInputElement>): void => {
    const enable = e.currentTarget.checked
    const currentState = passwordExpirationSettings.enabled

    if (!currentState && enable) {
      openPasswordExpirationModal(false)
      return
    }

    /* istanbul ignore else */ if (currentState && !enable) {
      confirmPasswordExpirySettings()
    }
  }

  const list = [
    {
      label: getString('common.authSettings.daysBeforePasswordExpires'),
      value: passwordExpirationSettings.daysBeforePasswordExpires
    },
    {
      label: getString('common.authSettings.daysBeforeUserNotified'),
      value: passwordExpirationSettings.daysBeforeUserNotifiedOfPasswordExpiration
    }
  ]

  return (
    <Collapse
      isOpen={passwordExpirationSettings.enabled}
      collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName, cssHarnessAccount.collapseIcon)}
      collapseClassName={cssConfiguration.collapseClassName}
      collapsedIcon="main-chevron-down"
      expandedIcon="main-chevron-up"
      heading={
        <Switch
          label={getString('common.authSettings.periodicallyExpirePassword')}
          checked={passwordExpirationSettings.enabled}
          onChange={onChangePasswordExpiry}
          disabled={updatingLoginSettings}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          data-testid="toggle-password-expire"
        />
      }
    >
      <Layout.Vertical
        spacing="small"
        padding={{ left: 'xxxlarge', top: 'medium', bottom: 'medium', right: 'medium' }}
        margin={{ bottom: 'large' }}
        className={cssHarnessAccount.passwordChecksDiv}
      >
        <Icon
          name="edit"
          intent="primary"
          margin="small"
          className={cssHarnessAccount.editIcon}
          onClick={() => openPasswordExpirationModal(true)}
          data-testid="update-password-expire-settings"
        />
        <Text margin={{ bottom: 'xsmall' }} color={Color.BLACK}>
          {getString('common.authSettings.periodicallyExpirePasswordNote')}
        </Text>
        {list.map(({ label, value }) => (
          <Container flex={{ justifyContent: 'flex-start' }} key={label}>
            <Text color={Color.GREY_800} icon="dot">
              {label}:
            </Text>
            <Text color={Color.GREY_800} font={{ weight: 'bold' }} padding={{ left: 'xsmall' }}>
              {value}
            </Text>
          </Container>
        ))}
      </Layout.Vertical>
    </Collapse>
  )
}

export default PasswordExpire
