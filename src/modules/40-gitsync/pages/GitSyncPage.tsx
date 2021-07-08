import React, { ReactNode } from 'react'
import { Layout, Text, Color, TabNavigation } from '@wings-software/uicore'
import { useParams, Link } from 'react-router-dom'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import NewUserView from './newUser/NewUserView'

interface GitSyncPageProps {
  children: ReactNode
}

export const GitSyncLandingView: React.FC<GitSyncPageProps> = ({ children }) => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { selectedProject, isGitSyncEnabled } = useAppStore()
  const { getString } = useStrings()
  useDocumentTitle(getString('gitManagement'))

  const renderBreadCrumb = React.useMemo(() => {
    return (
      <Layout.Vertical padding={{ left: 'small', top: 'large', bottom: 'large' }}>
        <Layout.Horizontal spacing="small" margin={{ bottom: 'small' }}>
          <Link to={`/account/${accountId}/projects/${projectIdentifier}/orgs/${orgIdentifier}/details`}>
            {selectedProject?.name}
          </Link>
          <span>/</span>
          <Text>{getString('gitManagement')}</Text>
        </Layout.Horizontal>
        <Text color={Color.GREY_800} font={{ size: 'medium' }}>
          {getString('gitManagement')}
        </Text>
      </Layout.Vertical>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier])

  return (
    <>
      <Page.Header
        size="medium"
        title={renderBreadCrumb}
        toolbar={
          isGitSyncEnabled ? (
            <TabNavigation
              links={[
                {
                  label: getString('repositories'),
                  to: routes.toGitSyncReposAdmin({ projectIdentifier, orgIdentifier, accountId, module })
                },
                {
                  label: getString('entities'),
                  to: routes.toGitSyncEntitiesAdmin({ projectIdentifier, orgIdentifier, accountId, module })
                }
              ]}
            />
          ) : null
        }
      />
      <Page.Body>{isGitSyncEnabled ? children : <NewUserView />}</Page.Body>
    </>
  )
}

const GitSyncPage: React.FC<GitSyncPageProps> = ({ children }) => {
  return (
    <GitSyncStoreProvider>
      <GitSyncLandingView>{children}</GitSyncLandingView>
    </GitSyncStoreProvider>
  )
}

export default GitSyncPage
