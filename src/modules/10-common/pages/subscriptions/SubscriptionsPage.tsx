import React from 'react'

import { Page } from '@common/components/Page/Page'
import { useStrings } from 'framework/strings'

const SubscriptionsPage: React.FC = () => {
  const { getString } = useStrings()
  return (
    <>
      <Page.Header title={getString('common.subscriptions')} />
    </>
  )
}

export default SubscriptionsPage
