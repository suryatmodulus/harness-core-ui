import React from 'react'
import { Container, Heading, Text, Icon, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'

export const CEDashboardPage: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Page.Body>
      <Container width={600} style={{ margin: '0 auto', paddingTop: 200 }}>
        <Layout.Vertical spacing="large" flex>
          <Heading>{getString('ce.dashboardPage.welcome')}</Heading>
          <Text>{getString('ce.dashboardPage.description')}</Text>
          <Icon name="nav-cd" size={200} />
        </Layout.Vertical>
      </Container>
    </Page.Body>
  )
}

export default CEDashboardPage
