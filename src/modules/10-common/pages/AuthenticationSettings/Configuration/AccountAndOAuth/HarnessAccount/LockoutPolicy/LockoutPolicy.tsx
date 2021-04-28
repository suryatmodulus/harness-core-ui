import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Layout, Icon, Text, Color, Container, Switch, Collapse } from '@wings-software/uicore'
import { useLockoutPolicyModal } from '@common/modals/LockoutPolicy/useLockoutPolicy'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useToaster } from '@common/components'
import type { LoginSettings } from 'services/cd-ng'
import { usePutLoginSettings } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import cssConfiguration from '@common/pages/AuthenticationSettings/Configuration/Configuration.module.scss'
import cssHarnessAccount from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/HarnessAccount.module.scss'

interface Props {
  loginSettings: LoginSettings
  refetchAuthSettings: () => void
}

const LockoutPolicy: React.FC<Props> = ({ loginSettings, refetchAuthSettings }) => {
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
    titleText: getString('common.authSettings.disableLockoutPolicy'),
    contentText: getString('common.authSettings.confirmDisableLockoutPolicy'),
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
            showSuccess(getString('common.authSettings.lockoutPolicyDisabled'), 5000)
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
      label: getString('common.authSettings.failedLoginsBeforeLockedAccount'),
      value: userLockoutSettings.numberOfFailedAttemptsBeforeLockout
    },
    {
      label: getString('common.authSettings.lockoutDuration'),
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
      label: getString('common.authSettings.notifyUsersWhenTheyLocked'),
      value: userLockoutSettings.notifyUser ? getString('yes') : /* istanbul ignore next */ getString('no')
    },
    {
      label: getString('common.authSettings.notifyUsersWHenUserLocked'),
      value: userLockoutSettings.userGroupsToNotify || getString('none')
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
          label={getString('common.authSettings.enforceLockoutPolicy')}
          checked={userLockoutSettings.enableLockoutPolicy}
          onChange={onChangeLockoutSettings}
          disabled={updatingLoginSettings}
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
        <Icon
          name="edit"
          intent="primary"
          margin="small"
          className={cssHarnessAccount.editIcon}
          onClick={() => openLockoutPolicyModal(true)}
          data-testid="update-lockout-policy"
        />
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
