import React from 'react'
import { Container, Button, Heading, Text, Icon, Layout } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useAppStore, useStrings } from 'framework/exports'

export const CDDashboardPage: React.FC = () => {
  const { projectIdentifier, accountId }: any = useParams()
  const { selectedProject: project } = useAppStore()
  const history = useHistory()
  const { getString } = useStrings()

  return (
    <Page.Body>
      <Container width={600} style={{ margin: '0 auto', paddingTop: 200 }}>
        <Layout.Vertical spacing="large" flex>
          <Heading>{getString('cdDashboard.welcome')}</Heading>
          <Text>{getString('cdDashboard.description')}</Text>
          <Icon name="cd-main" size={200} />
          <Button
            width={200}
            text={getString('cdDashboard.creatPipeline')}
            intent="primary"
            onClick={() =>
              history.push(
                routes.toPipelineStudio({
                  orgIdentifier: project?.orgIdentifier as string,
                  projectIdentifier: projectIdentifier as string,
                  pipelineIdentifier: '-1',
                  accountId,
                  module: 'cd'
                })
              )
            }
          />
        </Layout.Vertical>
      </Container>
    </Page.Body>
  )
}

export default CDDashboardPage
