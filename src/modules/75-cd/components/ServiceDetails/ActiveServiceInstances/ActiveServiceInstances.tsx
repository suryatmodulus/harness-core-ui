import React from 'react'
import { Card, Color, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ActiveServiceInstancesHeader } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesHeader'
import { ActiveServiceInstancesContent } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesContent'
import css from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

export const ActiveServiceInstances: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Card className={css.activeServiceInstances}>
      <Layout.Vertical height={'100%'}>
        <Text font={{ weight: 'bold' }} color={Color.GREY_600} margin={{ bottom: 'medium' }}>
          {getString('cd.serviceDashboard.activeServiceInstancesLabel')}
        </Text>
        <ActiveServiceInstancesHeader />
        <ActiveServiceInstancesContent />
      </Layout.Vertical>
    </Card>
  )
}
