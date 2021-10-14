import React, { useState } from 'react'
import { Button, ButtonVariation, ExpandingSearchInput, Layout, Tab, Tabs } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { GitSyncErrorsPanel } from '@gitsync/pages/errors/GitSyncErrorsPanel/GitSyncErrorsPanel'
import {
  GitErrorExperienceTab,
  GitSyncErrorStateType,
  GitSyncErrorState,
  GitErrorExperienceSubTab
} from '@gitsync/pages/errors/GitSyncErrorContext'
import styles from '@gitsync/pages/errors/GitSyncErrors.module.scss'

const GitSyncErrors: React.FC = () => {
  const { getString } = useStrings()

  const [selectedTab, setSelectedTab] = useState<GitErrorExperienceTab>(GitErrorExperienceTab.ALL_ERRORS)
  const [selectedView, setSelectedView] = useState<GitErrorExperienceSubTab | null>(
    GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [branch, setBranch] = useState('')
  const [repoIdentifier, setRepoIdentifier] = useState('')

  const contextValue: GitSyncErrorStateType = {
    selectedTab,
    view: selectedView,
    setView: setSelectedView,
    branch,
    repoIdentifier,
    searchTerm
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
            title={getString('common.allErrors')}
          />
          <Tab
            id={GitErrorExperienceTab.CONNECTIVITY_ERRORS}
            panel={<GitSyncErrorsPanel />}
            title={getString('common.connectivityErrors')}
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
            <Button variation={ButtonVariation.TERTIARY} icon="command-rollback" />
          </Layout.Horizontal>
        </Tabs>
      </GitSyncErrorState.Provider>
    </div>
  )
}

export default GitSyncErrors
