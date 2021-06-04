import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Layout, Text, Switch, Collapse, Color } from '@wings-software/uicore'
import type { LoginSettings } from 'services/cd-ng'
import { useToaster } from '@common/components'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { usePasswordStrengthModal } from '@auth-settings/modals/PasswordStrength/usePasswordStrength'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { usePutLoginSettings } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { PermissionRequest } from '@auth-settings/pages/Configuration/Configuration'
import cssConfiguration from '@auth-settings/pages/Configuration/Configuration.module.scss'
import cssHarnessAccount from '@auth-settings/pages/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount.module.scss'

interface Props {
  loginSettings: LoginSettings
  refetchAuthSettings: () => void
  permissionRequest: PermissionRequest
  canEdit: boolean
}

const PasswordStrength: React.FC<Props> = ({ loginSettings, refetchAuthSettings, permissionRequest, canEdit }) => {
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

  const { openDialog: confirmPasswordStrengthSettings } = useConfirmationDialog({
    titleText: getString('authSettings.disablePasswordStrength'),
    contentText: getString('authSettings.confirmDisablePasswordStrength'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const response = await updateLoginSettings({
            ...loginSettings,
            passwordStrengthPolicy: {
              ...passwordStrengthSettings,
              enabled: false
            }
          })

          /* istanbul ignore else */ if (response) {
            refetchAuthSettings()
            showSuccess(getString('authSettings.passwordStrengthDisabled'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
        }
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
    getString('authSettings.atLeastNChars', {
      minNumberOfCharacters: passwordStrengthSettings.minNumberOfCharacters
    }),
    passwordStrengthSettings.minNumberOfUppercaseCharacters
      ? getString('authSettings.haveOneUppercase')
      : /* istanbul ignore next */ '',
    passwordStrengthSettings.minNumberOfLowercaseCharacters
      ? getString('authSettings.haveOneLowercase')
      : /* istanbul ignore next */ '',
    passwordStrengthSettings.minNumberOfDigits ? getString('authSettings.haveOneDigit') : /* istanbul ignore next */ '',
    passwordStrengthSettings.minNumberOfSpecialCharacters
      ? getString('authSettings.haveOneSpecialChar')
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
          label={getString('authSettings.enforcePasswordStrength')}
          checked={passwordStrengthSettings.enabled}
          onChange={onChangePasswordStrength}
          disabled={!canEdit || updatingLoginSettings}
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
        <div className={cssHarnessAccount.editIcon}>
          <RbacButton
            minimal
            intent="primary"
            icon="edit"
            onClick={() => openPasswordStrengthModal(true)}
            data-testid="updatePasswordSettings"
            permission={{
              ...permissionRequest,
              permission: PermissionIdentifier.EDIT_AUTHSETTING
            }}
          />
        </div>
        <Text margin={{ bottom: 'xsmall' }} color={Color.BLACK}>
          {getString('authSettings.passwordMustFulfillReq')}
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
