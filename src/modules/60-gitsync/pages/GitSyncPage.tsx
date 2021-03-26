import React, { ReactNode } from 'react'
import { Layout, Text, Color, Icon } from '@wings-software/uicore'
import { useParams, Link, NavLink } from 'react-router-dom'
import { Page } from '@common/exports'

import { useStrings, useAppStore } from 'framework/exports'
import routes from '@common/RouteDefinitions'
import { PageSpinner } from '@common/components'
import { useIsGitSyncEnabled } from 'services/cd-ng'

import type { UseGetMockData } from '@common/utils/testUtils'
import NewUserView from './newUser/NewUserView'
import css from './GitSyncPage.module.scss'

interface GitSyncPageProps {
  children: ReactNode
  mockIsEnabled?: UseGetMockData<boolean>
}

const GitSyncPage: React.FC<GitSyncPageProps> = ({ children, mockIsEnabled }) => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams()
  const { selectedProject } = useAppStore()
  const { getString } = useStrings()

  const { data: isGitSyncEnabled, loading } = useIsGitSyncEnabled({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    mock: mockIsEnabled
  })

  const renderBreadCrumb = React.useMemo(() => {
    return (
      <Layout.Vertical padding={{ left: 'small', top: 'large', bottom: 'large' }}>
        <Layout.Horizontal spacing="small" margin={{ bottom: 'small' }}>
          <Link
            className={css.breadCrumb}
            to={`/account/${accountId}/projects/${projectIdentifier}/orgs/${orgIdentifier}/details`}
          >
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

  return loading ? (
    <PageSpinner />
  ) : (
    <>
      <Page.Header
        className={css.header}
        size={isGitSyncEnabled ? 'xlarge' : 'medium'}
        title={renderBreadCrumb}
        toolbar={
          isGitSyncEnabled ? (
            <Layout.Horizontal spacing="large">
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toGitSyncReposAdmin({ projectIdentifier, orgIdentifier, accountId })}
              >
                <Icon margin={{ right: 'small' }} name="repository" />
                {getString('repositories')}
              </NavLink>

              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toGitSyncEntitiesAdmin({ projectIdentifier, orgIdentifier, accountId })}
              >
                <Icon margin={{ right: 'small' }} name="entity" />
                {getString('entities')}
              </NavLink>
            </Layout.Horizontal>
          ) : null
        }
      />
      <Page.Body>{isGitSyncEnabled ? children : <NewUserView />}</Page.Body>
    </>
  )
}

export default GitSyncPage
