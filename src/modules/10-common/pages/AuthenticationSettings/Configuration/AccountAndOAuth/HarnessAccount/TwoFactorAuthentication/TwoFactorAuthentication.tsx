import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Card, Switch, Color, Text } from '@wings-software/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { useToaster } from '@common/components'
import { useSetTwoFactorAuthAtAccountLevel } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import css from './TwoFactorAuthentication.module.scss'

interface Props {
  twoFactorEnabled: boolean
  onSuccess: () => void
}

const TwoFactorAuthentication: React.FC<Props> = ({ twoFactorEnabled, onSuccess }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { currentUserInfo } = useAppStore()
  const { showSuccess, showError } = useToaster()

  const {
    mutate: updateTwoFactorAuthentication,
    loading: updatingTwoFactorAuthentication
  } = useSetTwoFactorAuthAtAccountLevel({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const submitUpdateTwoFactorAuthentication = async (
    adminOverrideTwoFactorEnabled: boolean,
    message: string
  ): Promise<void> => {
    try {
      const response = await updateTwoFactorAuthentication({
        adminOverrideTwoFactorEnabled
      })

      /* istanbul ignore else */ if (response) {
        onSuccess()
        showSuccess(message, 5000)
      }
    } catch (e) {
      /* istanbul ignore next */ showError(e.data?.message || e.message, 5000)
    }
  }

  const { openDialog: confirmRedirect } = useConfirmationDialog({
    titleText: getString('common.authSettings.enforceTwoFA'),
    contentText: getString('common.authSettings.yourAccountWillBeLockedOut'),
    confirmButtonText: getString('common.authSettings.goToSettings'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        history.push({
          pathname: routes.toUserProfile({ accountId }),
          search: 'openTwoFactorModal=true'
        })
      }
    }
  })

  const { openDialog: confirm2FAEnable } = useConfirmationDialog({
    titleText: getString('common.authSettings.enforceTwoFA'),
    contentText: (
      <React.Fragment>
        <Text color={Color.BLACK}>{getString('common.authSettings.doYouWantToEnforceTwoFAForAllMembers')}</Text>
        <ol type="1" className={css.listItem}>
          <li>{getString('common.authSettings.newMembersWillNeedToSetUpTwoFADuringSignup')}</li>
          <li>{getString('common.authSettings.existingMembersWillReceiveAnEmailWithQRCode')}</li>
        </ol>
      </React.Fragment>
    ),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        submitUpdateTwoFactorAuthentication(true, getString('common.authSettings.twoFAEnforcementEnabled'))
      }
    }
  })

  const { openDialog: confirm2FADisable } = useConfirmationDialog({
    titleText: getString('common.authSettings.disableTwoFAEnforcement'),
    contentText: getString('common.authSettings.sureToDisableTwoFAEnforcement'),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: isConfirmed => {
      /* istanbul ignore else */ if (isConfirmed) {
        submitUpdateTwoFactorAuthentication(false, getString('common.authSettings.twoFAEnforcementDisabled'))
      }
    }
  })

  const onChange2FASetting = (e: React.FormEvent<HTMLInputElement>): void => {
    const enable = e.currentTarget.checked
    const isTwoFactorAuthEnabledForCurrentUser = currentUserInfo.twoFactorAuthenticationEnabled

    if (!twoFactorEnabled && !isTwoFactorAuthEnabledForCurrentUser && enable) {
      confirmRedirect()
      return
    }

    if (!twoFactorEnabled && isTwoFactorAuthEnabledForCurrentUser && enable) {
      confirm2FAEnable()
      return
    }

    /* istanbul ignore else */ if (twoFactorEnabled && !enable) {
      confirm2FADisable()
    }
  }

  return (
    <Card className={css.twoFactorAuthentication}>
      <Switch
        label={getString('common.authSettings.enforceTwoFA')}
        checked={twoFactorEnabled}
        font={{ weight: 'semi-bold', size: 'normal' }}
        color={Color.GREY_800}
        onChange={onChange2FASetting}
        disabled={updatingTwoFactorAuthentication}
        data-testid="twoFA-toggle"
      />
    </Card>
  )
}

export default TwoFactorAuthentication
