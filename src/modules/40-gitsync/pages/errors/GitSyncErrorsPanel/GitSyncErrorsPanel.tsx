import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { defaultTo } from 'lodash-es'
import { Drawer, Position } from '@blueprintjs/core'
import { Layout, Pagination, PaginationProps, PageError, useModalHook, Button } from '@wings-software/uicore'
import {
  GitErrorExperienceSubTab,
  GitErrorExperienceTab,
  GitSyncErrorState
} from '@gitsync/pages/errors/GitSyncErrorContext'
import {
  ListGitToHarnessErrorsCommitsQueryParams,
  useListGitToHarnessErrorsCommits,
  GitSyncErrorAggregateByCommitDTO,
  useListGitSyncErrors,
  GitSyncErrorDTO,
  GetYamlSchemaQueryParams
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { PageSpinner } from '@common/components'
import { Toggle, ToggleProps } from '@common/components/Toggle/Toggle'
import { useStrings } from 'framework/strings'
import type { GitSyncErrorMessageProps } from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessageItem'
import { GitSyncErrorMessage, parseCommitItems } from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessage'
import styles from '@gitsync/pages/errors/GitSyncErrorsPanel/GitSyncErrorsPanel.module.scss'

const parseDataForCommitView = (data: GitSyncErrorAggregateByCommitDTO[] = []): GitSyncErrorMessageProps[] => {
  return data.map(item => ({
    mode: 'COMMIT',
    title: item.commitMessage || '',
    count: item.failedCount,
    repo: item.repoId,
    branch: item.branchName,
    commitId: item.gitCommitId,
    timestamp: item.createdAt,
    items: parseCommitItems(defaultTo(item.errorsForSummaryView, []))
  }))
}

const parseDataForFileView = (
  data: GitSyncErrorDTO[],
  onShowDetails: (yamlContent: string) => void
): GitSyncErrorMessageProps[] => {
  return data.map(item => ({
    mode: 'FILE',
    title: item.completeFilePath || '',
    timestamp: item.createdAt,
    items: [
      {
        reason: item.failureReason || '',
        ...(item.additionalErrorDetails?.yamlContent
          ? {
              showDetails: () => {
                onShowDetails(item.additionalErrorDetails?.yamlContent)
              }
            }
          : {})
      }
    ]
  }))
}

const parseDataForConnectivityView = (data: GitSyncErrorDTO[] = []): GitSyncErrorMessageProps[] => {
  return data.map(item => ({
    mode: 'CONNECTIVITY',
    title: item.failureReason || '',
    repo: item.repoId,
    branch: item.branchName,
    timestamp: item.createdAt,
    items: []
  }))
}

const drawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: true,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '40%',
  isCloseButtonShown: true
}

const GitErrorExperienceToggle: React.FC<{
  selectedTab: GitErrorExperienceTab
  setView: Dispatch<SetStateAction<GitErrorExperienceSubTab | null>>
}> = props => {
  const { getString } = useStrings()
  const { selectedTab, setView } = props
  if (selectedTab === GitErrorExperienceTab.ALL_ERRORS) {
    const toggleProps: ToggleProps<GitErrorExperienceSubTab> = {
      options: [
        {
          label: getString('commits'),
          value: GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW
        },
        {
          label: getString('common.files'),
          value: GitErrorExperienceSubTab.ALL_ERRORS_FILE_VIEW
        }
      ],
      beforeOnChange: (view, callback) => {
        setView(view)
        callback(view)
      },
      className: styles.toggle
    }
    return (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Toggle {...toggleProps} />
      </Layout.Horizontal>
    )
  }
  return <></>
}

export const GitSyncErrorsPanel: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { selectedTab, view, setView, searchTerm, branch, repoIdentifier, reloadAction } = useContext(GitSyncErrorState)
  const isCommitView = view === GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW
  const isFileView = view === GitErrorExperienceSubTab.ALL_ERRORS_FILE_VIEW

  const [pageIndex, setPageIndex] = useState(0)
  const [selectedYaml, setSelectedYaml] = useState('')

  const { getString } = useStrings()

  const queryParams: ListGitToHarnessErrorsCommitsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    searchTerm,
    branch,
    repoIdentifier,
    pageIndex,
    pageSize: 10,
    ...(isCommitView ? {} : { gitToHarness: isFileView })
  }

  const { data, loading, error, refetch } = (isCommitView ? useListGitToHarnessErrorsCommits : useListGitSyncErrors)({
    queryParams
  })

  reloadAction.current = refetch

  const paginationProps: PaginationProps = {
    itemCount: data?.data?.totalItems || 0,
    pageSize: data?.data?.pageSize || 0,
    pageCount: data?.data?.totalPages || 0,
    pageIndex: data?.data?.pageIndex || 0,
    gotoPage: pageNumber => setPageIndex(pageNumber)
  }

  const [showModal, hideDrawer] = useModalHook(() => {
    return (
      <Drawer
        onClose={() => {
          hideDrawer()
        }}
        {...drawerProps}
      >
        <Button
          minimal
          className={styles.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            hideDrawer()
          }}
        />
        <YAMLBuilder
          entityType={'' as GetYamlSchemaQueryParams['entityType']}
          fileName={getString('gitsync.fileContent')}
          isReadOnlyMode
          isEditModeSupported={false}
          existingJSON={parse(selectedYaml)}
          showSnippetSection={false}
        />
      </Drawer>
    )
  }, [selectedYaml])

  const onShowDetails = (yamlContent: string): void => {
    setSelectedYaml(yamlContent)
    showModal()
  }

  const Component = (): React.ReactElement => {
    if (loading) {
      return <PageSpinner />
    }
    if (error) {
      return <PageError onClick={() => refetch()} />
    }

    const parsedData = isCommitView
      ? parseDataForCommitView(data?.data?.content)
      : isFileView
      ? parseDataForFileView(defaultTo(data?.data?.content, []), onShowDetails)
      : parseDataForConnectivityView(data?.data?.content)

    return (
      <Layout.Vertical height="100%">
        <Layout.Vertical className={styles.gitSyncErrorsPanel}>
          {parsedData.map(item => (
            <GitSyncErrorMessage key={item.commitId} {...item} />
          ))}
        </Layout.Vertical>
        <Pagination {...paginationProps} />
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical padding={{ left: 'large', right: 'large' }}>
      <GitErrorExperienceToggle selectedTab={selectedTab} setView={setView} />
      <Component />
    </Layout.Vertical>
  )
}
