import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Layout, Icon, Text, Switch, Collapse, Color } from '@wings-software/uicore'
import type { LoginSettings, PasswordStrengthPolicy } from 'services/cd-ng'
import { useToaster } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { usePasswordStrengthModal } from '@common/modals/PasswordStrength/usePasswordStrength'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { usePutLoginSettings } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import cssConfiguration from '@common/pages/AuthenticationSettings/Configuration/Configuration.module.scss'
import cssHarnessAccount from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount.module.scss'

interface Props {
  loginSettings: LoginSettings
  refetchAuthSettings: () => void
}

const PasswordStrength: React.FC<Props> = ({ loginSettings, refetchAuthSettings }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const passwordStrengthSettings = loginSettings.passwordStrengthPolicy

  const onSuccess = (): void => {
    refetchAuthSettings()
  }
  const { openPasswordStrengthModal } = usePasswordStrengthModal({ onSuccess, loginSettings })
  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const submitPasswordStrengthSettings = async (passwordStrengthPolicy: PasswordStrengthPolicy): Promise<void> => {
    try {
      const response = await updateLoginSettings({
        ...loginSettings,
        passwordStrengthPolicy
      })

      /* istanbul ignore else */ if (response) {
        refetchAuthSettings()
        showSuccess(getString('common.authSettings.passwordStrengthDisabled'), 5000)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
    }
  }

  const { openDialog: confirmPasswordStrengthSettings } = useConfirmationDialog({
    cancelButtonText: getString('common.cancel'),
    titleText: getString('common.authSettings.disablePasswordStrength'),
    contentText: getString('common.authSettings.confirmDisablePasswordStrength'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        submitPasswordStrengthSettings({
          ...passwordStrengthSettings,
          enabled: false
        })
      }
    }
  })

  const onChangePasswordStrength = (e: React.FormEvent<HTMLInputElement>): void => {
    const enable = e.currentTarget.checked
    const currentState = passwordStrengthSettings.enabled

    if (!currentState && enable) {
      openPasswordStrengthModal(false)
      return
    }

    /* istanbul ignore else */ if (currentState && !enable) {
      confirmPasswordStrengthSettings()
    }
  }

  const list = [
    getString('common.authSettings.atLeastNChars', {
      minNumberOfCharacters: passwordStrengthSettings.minNumberOfCharacters
    }),
    passwordStrengthSettings.minNumberOfUppercaseCharacters
      ? getString('common.authSettings.haveOneUppercase')
      : /* istanbul ignore next */ '',
    passwordStrengthSettings.minNumberOfLowercaseCharacters
      ? getString('common.authSettings.haveOneLowercase')
      : /* istanbul ignore next */ '',
    passwordStrengthSettings.minNumberOfDigits
      ? getString('common.authSettings.haveOneDigit')
      : /* istanbul ignore next */ '',
    passwordStrengthSettings.minNumberOfSpecialCharacters
      ? getString('common.authSettings.haveOneSpecialChar')
      : /* istanbul ignore next */ ''
  ].filter(item => item)

  return (
    <Collapse
      isOpen={passwordStrengthSettings.enabled}
      collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName, cssHarnessAccount.collapseIcon)}
      collapseClassName={cssConfiguration.collapseClassName}
      collapsedIcon="main-chevron-down"
      expandedIcon="main-chevron-up"
      heading={
        <Switch
          label={getString('common.authSettings.enforcePasswordStrength')}
          checked={passwordStrengthSettings.enabled}
          onChange={onChangePasswordStrength}
          disabled={updatingLoginSettings}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          data-testid="toggle-password-strength"
        />
      }
    >
      <Layout.Vertical
        spacing="small"
        padding={{ left: 'xxxlarge', top: 'medium', bottom: 'medium' }}
        margin={{ bottom: 'large' }}
        className={cssHarnessAccount.passwordChecksDiv}
      >
        <Icon
          name="edit"
          intent="primary"
          margin="small"
          className={cssHarnessAccount.editIcon}
          onClick={() => openPasswordStrengthModal(true)}
          data-testid="updatePasswordSettings"
        />
        <Text margin={{ bottom: 'xsmall' }} color={Color.BLACK}>
          {getString('common.authSettings.passwordMustFulfillReq')}
        </Text>
        {list.map(listItem => (
          <Text color={Color.GREY_800} icon="dot" key={listItem}>
            {listItem}
          </Text>
        ))}
      </Layout.Vertical>
    </Collapse>
  )
}

export default PasswordStrength
