import React, { ReactNode } from 'react'
import { TabNavigation } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import NewUserView from './newUser/NewUserView'

interface GitSyncPageProps {
  children: ReactNode
}

export const GitSyncLandingView: React.FC<GitSyncPageProps> = ({ children }) => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { isGitSyncEnabled } = useAppStore()
  const { getString } = useStrings()

  useDocumentTitle(getString('gitManagement'))

  return (
    <>
      <Page.Header
        size="medium"
        breadcrumbs={<NGBreadcrumbs />}
        title={getString('gitManagement')}
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
                },
                {
                  label: getString('errors'),
                  to: routes.toGitSyncErrors({ projectIdentifier, orgIdentifier, accountId, module })
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
