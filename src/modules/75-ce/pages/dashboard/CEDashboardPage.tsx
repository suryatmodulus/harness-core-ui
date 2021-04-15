import React from 'react'
import { Container, Heading, Text, Icon, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import i18n from './CEDashboardPage.i18n'

export const CEDashboardPage: React.FC = () => {
  return (
    <Page.Body>
      <Container width={600} style={{ margin: '0 auto', paddingTop: 200 }}>
        <Layout.Vertical spacing="large" flex>
          <Heading>{i18n.welcome}</Heading>
          <Text>{i18n.description}</Text>
          <Icon name="nav-cd" size={200} />
        </Layout.Vertical>
      </Container>
    </Page.Body>
  )
}

export default CEDashboardPage
