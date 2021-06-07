import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Color, Text, Container } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components/Page/PageSpinner'

import {
  GitSyncEntityDTO,
  PageGitSyncEntityListDTO,
  useListGitSyncEntitiesByType,
  ListGitSyncEntitiesByTypePathParams,
  GitSyncConfig,
  GitEntityFilterProperties
} from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getTableColumns } from './EntityHelper'
import css from './GitSyncEntityTab.module.scss'

interface EntitiesListingProps {
  selectedProduct: GitEntityFilterProperties['moduleType']
  entityType: ListGitSyncEntitiesByTypePathParams['entityType']
  gitSyncConfigId: GitSyncConfig['identifier']
  branch: GitSyncConfig['branch']
  backToSummary: () => void
}

interface EntityListViewProps {
  data: PageGitSyncEntityListDTO | undefined
  gotoPage: (pageNumber: number) => void
  refetch: () => void
}

const EntityListView: React.FC<EntityListViewProps> = props => {
  const data = props.data?.content?.[0]

  return (
    <Table<GitSyncEntityDTO>
      className={css.table}
      columns={getTableColumns()}
      data={data?.gitSyncEntities || []}
      sortable={true}
      pagination={{
        itemCount: props.data?.totalItems || 0,
        pageSize: props.data?.pageSize || 10,
        pageCount: props.data?.totalPages || -1,
        pageIndex: props.data?.pageIndex || 0,
        gotoPage: props.gotoPage
      }}
    />
  )
}

const EntitiesListing: React.FC<EntitiesListingProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [page, setPage] = useState(0)

  const { loading: loadingEntityList, data: dataAllEntities, refetch } = useListGitSyncEntitiesByType({
    entityType: props.entityType,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      page: page,
      branch: props.branch,
      gitSyncConfigId: props.gitSyncConfigId,
      size: 2
    }
  })

  if (loadingEntityList) {
    return <PageSpinner />
  }

  return (
    <Container padding="small">
      <EntityListView
        data={dataAllEntities?.data}
        refetch={refetch}
        gotoPage={pageNumber => setPage(pageNumber)}
      ></EntityListView>
      <Text padding="large" color={Color.BLUE_500} onClick={() => props.backToSummary()}>
        {getString('gitsync.seeLess')}
      </Text>
    </Container>
  )
}

export default EntitiesListing
