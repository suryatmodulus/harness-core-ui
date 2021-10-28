import React, { createRef, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { Button, ButtonVariation, Color, ExpandingSearchInput, Layout, Tab, Tabs, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetGitSyncErrorsCount } from 'services/cd-ng'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { GitSyncErrorsPanel } from '@gitsync/pages/errors/GitSyncErrorsPanel/GitSyncErrorsPanel'
import {
  GitErrorExperienceTab,
  GitSyncErrorStateType,
  GitSyncErrorState,
  GitErrorExperienceSubTab
} from '@gitsync/pages/errors/GitSyncErrorContext'
import styles from '@gitsync/pages/errors/GitSyncErrors.module.scss'

export const GitSyncErrorsWithRedirect: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { NG_GIT_ERROR_EXPERIENCE } = useFeatureFlags()
  return NG_GIT_ERROR_EXPERIENCE ? (
    <GitSyncErrors />
  ) : (
    <Redirect to={routes.toGitSyncReposAdmin({ accountId, orgIdentifier, projectIdentifier, module })} />
  )
}

const TabTitle: React.FC<{ title: string; count: number; showCount: boolean }> = props => {
  const { title, count, showCount } = props
  return (
    <Layout.Horizontal>
      <Text className={styles.tabTitle}>{title}</Text>
      {showCount ? (
        <Text color={Color.RED_600} font={{ weight: 'bold' }}>
          {count}
        </Text>
      ) : (
        <></>
      )}
    </Layout.Horizontal>
  )
}

const GitSyncErrors: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const [selectedTab, setSelectedTab] = useState<GitErrorExperienceTab>(GitErrorExperienceTab.ALL_ERRORS)
  const [selectedView, setSelectedView] = useState<GitErrorExperienceSubTab | null>(
    GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [branch, setBranch] = useState('')
  const [repoIdentifier, setRepoIdentifier] = useState('')
  const reloadAction = createRef<() => void>()

  const contextValue: GitSyncErrorStateType = {
    selectedTab,
    view: selectedView,
    setView: setSelectedView,
    branch,
    repoIdentifier,
    searchTerm,
    reloadAction
  }

  const onTabSwitch = (tabId: GitErrorExperienceTab): void => {
    if (tabId === GitErrorExperienceTab.CONNECTIVITY_ERRORS) {
      setSelectedView(null)
    } else {
      setSelectedView(GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW)
    }
    setSelectedTab(tabId)
  }

  const setGitFilters = ({ branch: filterBranch, repo: filterRepo }: GitFilterScope): void => {
    setBranch(filterBranch || '')
    setRepoIdentifier(filterRepo)
  }

  const {
    loading: isCountLoading,
    data: countData,
    error: countError
  } = useGetGitSyncErrorsCount({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      searchTerm,
      branch,
      repoIdentifier
    }
  })

  const { gitToHarnessErrorCount = 0, connectivityErrorCount = 0 } = countData?.data || {}
  const showCountData = !!(countData?.data && !isCountLoading && !countError)

  return (
    <div className={styles.tabContainer} data-testid="gitSyncErrorsTabContainer">
      <GitSyncErrorState.Provider value={contextValue}>
        <Tabs id="gitSyncErrorsTab" onChange={onTabSwitch}>
          <Layout.Horizontal className={styles.gitSyncErrorsHeaderSides}>
            <GitFilters defaultValue={{ repo: '', branch: '' }} onChange={setGitFilters} />
          </Layout.Horizontal>
          <Tab
            id={GitErrorExperienceTab.ALL_ERRORS}
            panel={<GitSyncErrorsPanel />}
            title={
              <TabTitle
                title={getString('common.allErrors')}
                count={gitToHarnessErrorCount}
                showCount={showCountData}
              />
            }
          />
          <Tab
            id={GitErrorExperienceTab.CONNECTIVITY_ERRORS}
            panel={<GitSyncErrorsPanel />}
            title={
              <TabTitle
                title={getString('common.connectivityErrors')}
                count={connectivityErrorCount}
                showCount={showCountData}
              />
            }
          />
          <Layout.Horizontal className={styles.gitSyncErrorsHeaderSides} flex={{ justifyContent: 'flex-end' }}>
            <ExpandingSearchInput
              alwaysExpanded
              width={250}
              placeholder={getString('search')}
              throttle={200}
              onChange={setSearchTerm}
              className={styles.searchInput}
            />
            <Button
              variation={ButtonVariation.TERTIARY}
              icon="command-rollback"
              onClick={() => reloadAction.current?.()}
            />
          </Layout.Horizontal>
        </Tabs>
      </GitSyncErrorState.Provider>
    </div>
  )
}

export default GitSyncErrors
