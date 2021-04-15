import React from 'react'
import { Container, Button, Heading, Text, Icon, Layout } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useAppStore } from 'framework/exports'
import i18n from './CIDashboardPage.i18n'

export const CIDashboardPage: React.FC = () => {
  const { projectIdentifier, accountId } = useParams()
  const { selectedProject } = useAppStore()
  const project = selectedProject
  const history = useHistory()

  return (
    <Page.Body>
      <Container width={600} style={{ margin: '0 auto', paddingTop: 200 }}>
        <Layout.Vertical spacing="large" flex>
          <Heading>{i18n.welcome}</Heading>
          <Text>{i18n.description}</Text>
          <Icon padding={'xxxlarge'} name="ci-main" size={100} />
          <Button
            width={200}
            text={i18n.creatPipeline}
            intent="primary"
            onClick={() =>
              history.push(
                routes.toPipelineStudio({
                  accountId,
                  orgIdentifier: project?.orgIdentifier as string,
                  projectIdentifier: projectIdentifier,
                  pipelineIdentifier: '-1',
                  module: 'ci'
                })
              )
            }
          />
        </Layout.Vertical>
      </Container>
    </Page.Body>
  )
}

export default CIDashboardPage
