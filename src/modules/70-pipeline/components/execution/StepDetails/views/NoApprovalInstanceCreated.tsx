import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

export const NoApprovalInstance = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical height="100%">
      <Text intent="warning" padding="huge" font={{ align: 'center' }}>
        {getString('pipeline.noApprovalInstanceCreated')}
      </Text>
    </Layout.Vertical>
  )
}
