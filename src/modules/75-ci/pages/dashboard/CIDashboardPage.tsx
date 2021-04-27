import React from 'react'
import { Container, Heading, Text, Icon, Layout } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'

export const CIDashboardPage: React.FC = () => {
  const { projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()
  const project = selectedProject
  const history = useHistory()
  const { getString } = useStrings()
  return (
    <Page.Body>
      <Container width={600} style={{ margin: '0 auto', paddingTop: 200 }}>
        <Layout.Vertical spacing="large" flex>
          <Heading>{getString('ci.welcome')}</Heading>
          <Text>{getString('ci.description')}</Text>
          <Icon padding={'xxxlarge'} name="ci-main" size={100} />
          <RbacButton
            width={200}
            text={getString('ci.createPipeline')}
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

export default CIDashboardPage
