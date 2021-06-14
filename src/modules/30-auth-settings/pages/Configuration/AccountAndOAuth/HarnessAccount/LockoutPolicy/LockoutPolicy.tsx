import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Layout, Text, Color, Container, Switch, Collapse } from '@wings-software/uicore'
import { useLockoutPolicyModal } from '@auth-settings/modals/LockoutPolicy/useLockoutPolicy'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useToaster } from '@common/components'
import type { LoginSettings } from 'services/cd-ng'
import { usePutLoginSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
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

const LockoutPolicy: React.FC<Props> = ({ loginSettings, refetchAuthSettings, permissionRequest, canEdit }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const userLockoutSettings = loginSettings.userLockoutPolicy

  const onSuccess = (): void => {
    refetchAuthSettings()
  }

  const { openLockoutPolicyModal } = useLockoutPolicyModal({ onSuccess, loginSettings })

  const { mutate: updateLoginSettings, loading: updatingLoginSettings } = usePutLoginSettings({
    loginSettingsId: loginSettings.uuid,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { openDialog: confirmLockoutSettings } = useConfirmationDialog({
    titleText: getString('authSettings.disableLockoutPolicy'),
    contentText: getString('authSettings.confirmDisableLockoutPolicy'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const response = await updateLoginSettings({
            ...loginSettings,
            userLockoutPolicy: {
              ...userLockoutSettings,
              enableLockoutPolicy: false
            }
          })

          /* istanbul ignore else */ if (response) {
            refetchAuthSettings()
            showSuccess(getString('authSettings.lockoutPolicyDisabled'), 5000)
          }
        } catch (e) {
          /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
        }
      }
    }
  })

  const onChangeLockoutSettings = (e: React.FormEvent<HTMLInputElement>): void => {
    e.stopPropagation()
    const enable = e.currentTarget.checked
    const currentState = userLockoutSettings.enableLockoutPolicy

    if (!currentState && enable) {
      openLockoutPolicyModal(false)
      return
    }

    /* istanbul ignore else */ if (currentState && !enable) {
      confirmLockoutSettings()
    }
  }

  const list = [
    {
      label: getString('authSettings.failedLoginsBeforeLockedAccount'),
      value: userLockoutSettings.numberOfFailedAttemptsBeforeLockout
    },
    {
      label: getString('authSettings.lockoutDuration'),
      value: (
        <>
          <Text color={Color.GREY_800} font={{ weight: 'bold' }} padding={{ left: 'xsmall', right: 'xsmall' }}>
            {userLockoutSettings.lockOutPeriod}
          </Text>
          <Text color={Color.GREY_800}>{getString('hours')}</Text>
        </>
      )
    },
    {
      label: getString('authSettings.notifyUsersWhenTheyLocked'),
      value: userLockoutSettings.notifyUser ? getString('yes') : /* istanbul ignore next */ getString('no')
    },
    {
      label: getString('authSettings.notifyUsersWhenUserLocked'),
      value: userLockoutSettings.userGroupsToNotify?.map(userGroup => userGroup.name).join(', ') || getString('none')
    }
  ]

  return (
    <Collapse
      isOpen={userLockoutSettings.enableLockoutPolicy}
      collapseHeaderClassName={cx(cssConfiguration.collapseHeaderClassName, cssHarnessAccount.collapseIcon)}
      collapseClassName={cssConfiguration.collapseClassName}
      collapsedIcon="main-chevron-down"
      expandedIcon="main-chevron-up"
      heading={
        <Switch
          label={getString('authSettings.enforceLockoutPolicy')}
          checked={userLockoutSettings.enableLockoutPolicy}
          onChange={onChangeLockoutSettings}
          disabled={!canEdit || updatingLoginSettings}
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.GREY_800}
          data-testid="toggle-lockout-policy"
        />
      }
    >
      <Layout.Vertical
        spacing="small"
        padding={{ left: 'xxxlarge', top: 'medium', bottom: 'medium', right: 'medium' }}
        margin={{ bottom: 'large' }}
        className={cssHarnessAccount.passwordChecksDiv}
      >
        <div className={cssHarnessAccount.editIcon}>
          <RbacButton
            minimal
            intent="primary"
            icon="edit"
            onClick={() => openLockoutPolicyModal(true)}
            data-testid="update-lockout-policy"
            permission={{
              ...permissionRequest,
              permission: PermissionIdentifier.EDIT_AUTHSETTING
            }}
          />
        </div>
        {list.map(({ label, value }) => (
          <Container flex={{ justifyContent: 'flex-start' }} key={label}>
            <Text color={Color.GREY_800} icon="dot">
              {label}:
            </Text>
            {React.isValidElement(value) ? (
              value
            ) : (
              <Text color={Color.GREY_800} font={{ weight: 'bold' }} padding={{ left: 'xsmall' }}>
                {value}
              </Text>
            )}
          </Container>
        ))}
      </Layout.Vertical>
    </Collapse>
  )
}

export default LockoutPolicy
