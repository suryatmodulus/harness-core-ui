import React from 'react'
import { Card, Color, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ActiveServiceInstancesHeader } from '@dashboards/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesHeader'
import { ActiveServiceInstancesContent } from '@dashboards/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesContent'
import css from '@dashboards/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

export const ActiveServiceInstances: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Card className={css.activeServiceInstances}>
      <Layout.Vertical height={'100%'}>
        <Text font={{ weight: 'bold' }} color={Color.GREY_600} margin={{ bottom: 'medium' }}>
          {getString('dashboards.serviceDashboard.activeServiceInstancesLabel')}
        </Text>
        <ActiveServiceInstancesHeader />
        <ActiveServiceInstancesContent />
      </Layout.Vertical>
    </Card>
  )
}
