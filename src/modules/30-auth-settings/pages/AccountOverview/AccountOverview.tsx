import React from 'react'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import AccountDetails from '@auth-settings/pages/AccountOverview/views/AccountDetails'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import SubscribedModules from '@auth-settings/pages/AccountOverview/views/SubscribedModules'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

const AccountOverview: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()
  const { NG_LICENSES_ENABLED } = useFeatureFlags()
  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG
  return (
    <>
      <Page.Header title={getString('common.accountOverview')} />
      <Page.Body>
        <AccountDetails />
        {(createdFromNG || NG_LICENSES_ENABLED) && <SubscribedModules />}
      </Page.Body>
    </>
  )
}

export default AccountOverview
