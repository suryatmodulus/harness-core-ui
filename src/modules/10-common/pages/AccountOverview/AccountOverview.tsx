import React from 'react'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import AccountDetails from '@common/pages/AccountOverview/views/AccountDetails'

const AccountOverview: React.FC = () => {
  const { getString } = useStrings()
  return (
    <>
      <Page.Header title={getString('common.accountOverview')} />
      <Page.Body>
        <AccountDetails />
      </Page.Body>
    </>
  )
}

export default AccountOverview
