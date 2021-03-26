import React from 'react'
import { Layout, Container, Text, WeightedStack } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'

import mockData from './mocks/service-details.json'

interface ActiveServiceInstancesProps {
  id?: string
}

const ActiveServiceInstances: React.FC<ActiveServiceInstancesProps> = () => {
  const { getString } = useStrings()
  return (
    <Container width={600} height={600} border={{ color: 'dark' }}>
      <Layout.Vertical spacing="medium">
        <Layout.Vertical spacing="medium">
          <Text font="medium">{getString('serviceDashboard.activeServiceInstancesLabel')}</Text>
          <Layout.Horizontal spacing="medium">
            <Text font="large">{mockData.details.total}</Text>
            <WeightedStack
              data={[
                { label: getString('nonProduction'), value: 12, color: 'blue500' },
                { label: getString('production'), value: 2, color: 'blue450' }
              ]}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </Container>
  )
}

export default ActiveServiceInstances
