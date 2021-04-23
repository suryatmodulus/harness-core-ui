import React from 'react'
import { Container, Heading, Text, Icon, Layout } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export const CDDashboardPage: React.FC = () => {
  const { projectIdentifier, accountId } = useParams<ProjectPathProps>()
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
          <RbacButton
            width={200}
            text={getString('common.createPipeline')}
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
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier: project?.orgIdentifier,
                projectIdentifier
              },
              permission: PermissionIdentifier.EDIT_PIPELINE
            }}
          />
        </Layout.Vertical>
      </Container>
    </Page.Body>
  )
}

export default CDDashboardPage
