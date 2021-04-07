import React, { useMemo } from 'react'
import { Button, Layout, Text, Container, Icon, Color } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import Table from '@common/components/Table/Table'

import type { GitSyncConfig } from 'services/cd-ng'

import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useStrings } from 'framework/exports'
import { getGitConnectorIcon } from '@gitsync/common/gitSyncUtils'
import { useGitSyncStore } from '@gitsync/common/GitSyncStoreContext'
import css from './GitSyncRepoTab.module.scss'

const GitSyncRepoTab: React.FC = () => {
  const { gitSyncRepos, refreshStore } = useGitSyncStore()

  const { openGitSyncModal } = useCreateGitSyncModal({
    onSuccess: async () => {
      refreshStore()
    },
    onClose: async () => {
      refreshStore()
    }
  })

  const RenderColumnReponame: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original

    return (
      <Layout.Horizontal spacing="small">
        <Icon name={getGitConnectorIcon(data.gitConnectorType)} size={30}></Icon>
        <div className={css.wrapper}>
          <Text className={css.name} color={Color.BLACK} title={data.name}>
            {data.name}
          </Text>
          <Text className={css.name} color={Color.GREY_400} title={data.identifier}>
            {data.identifier}
          </Text>
        </div>
      </Layout.Horizontal>
    )
  }

  const RenderColumnRepo: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original
    return (
      <div className={css.wrapper}>
        <Text className={css.name}>{data.repo}</Text>
      </div>
    )
  }

  const RenderColumnBranch: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original
    return (
      <div className={css.wrapper}>
        <Text className={css.name}>{data.branch}</Text>
      </div>
    )
  }

  const RenderColumnMenu: Renderer<CellProps<GitSyncConfig>> = () => {
    return (
      <Container className={css.menuContainer}>
        <Button
          minimal
          icon="Options"
          onClick={e => {
            e.stopPropagation()
          }}
        />
      </Container>
    )
  }

  const { getString } = useStrings()

  const columns: Column<GitSyncConfig>[] = useMemo(
    () => [
      {
        Header: getString('name').toUpperCase(),
        accessor: 'repo',
        id: 'reponame',
        width: '20%',
        Cell: RenderColumnReponame
      },
      {
        Header: getString('gitsync.repositoryPath').toUpperCase(),
        accessor: 'repo',
        id: 'repo',
        width: '50%',
        Cell: RenderColumnRepo
      },
      {
        Header: getString('primaryBranch').toUpperCase(),
        accessor: 'branch',
        id: 'branch',
        width: '25%',
        Cell: RenderColumnBranch
      },
      {
        Header: '',
        accessor: row => row.identifier,
        width: '5%',
        id: 'action',
        Cell: RenderColumnMenu,
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gitSyncRepos?.length]
  )
  return (
    <Container padding="large">
      <Button
        intent="primary"
        text={getString('addRepository')}
        icon="plus"
        onClick={() => openGitSyncModal(false, false, undefined)}
        id="newRepoBtn"
        margin={{ left: 'xlarge', bottom: 'small' }}
      />
      <Table<GitSyncConfig> className={css.table} columns={columns} data={gitSyncRepos || []} />
    </Container>
  )
}

export default GitSyncRepoTab
