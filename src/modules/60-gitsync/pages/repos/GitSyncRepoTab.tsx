import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Layout, Text, Container, Icon } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import Table from '@common/components/Table/Table'
import { PageSpinner } from '@common/components/Page/PageSpinner'

import { GitSyncConfig, useListGitSync } from 'services/cd-ng'

import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useStrings } from 'framework/exports'
import { getGitConnectorIcon } from '@gitsync/common/gitSyncUtils'
import css from './GitSyncRepo.module.scss'

const GitSyncRepoTab: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams()

  //Note: right now we support git-sync only at project level
  const { data: dataAllGitSync, loading, refetch } = useListGitSync({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { openGitSyncModal } = useCreateGitSyncModal({
    onSuccess: async () => {
      refetch()
    },
    onClose: async () => {
      refetch()
    }
  })

  const RenderColumnRepo: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original
    return (
      <Layout.Horizontal spacing="small">
        <Icon name={getGitConnectorIcon(data.gitConnectorType)} />
        <Text>{data.repo}</Text>
      </Layout.Horizontal>
    )
  }

  const RenderColumnBranch: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original
    return (
      <Layout.Horizontal spacing="small">
        <Text>{data.branch}</Text>
      </Layout.Horizontal>
    )
  }

  const { getString } = useStrings()

  const columns: Column<GitSyncConfig>[] = useMemo(
    () => [
      {
        Header: getString('repositories').toUpperCase(),
        accessor: 'repo',
        id: 'repo',
        width: '25%',
        Cell: RenderColumnRepo
      },
      {
        Header: getString('primaryBranch').toUpperCase(),
        accessor: 'branch',
        id: 'branch',
        width: '35%',
        Cell: RenderColumnBranch
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataAllGitSync?.length]
  )
  return loading ? (
    <PageSpinner />
  ) : (
    <Container padding="large">
      <Button
        intent="primary"
        text={getString('addRepository')}
        icon="plus"
        onClick={() => openGitSyncModal(false, false, undefined)}
        id="newRepoBtn"
        margin={{ left: 'xlarge', bottom: 'small' }}
      />
      <Table<GitSyncConfig> className={css.table} columns={columns} data={dataAllGitSync || []} />
    </Container>
  )
}

export default GitSyncRepoTab
