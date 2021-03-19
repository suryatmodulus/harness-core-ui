import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'

const IPSetup: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical
      spacing="medium"
      padding="medium"
      style={{ backgroundColor: 'var(--grey-200)', maxWidth: '755px' }}
    >
      <Text>{getString('ce.co.ipAddressSetup')}</Text>
    </Layout.Vertical>
  )
}

export default IPSetup
