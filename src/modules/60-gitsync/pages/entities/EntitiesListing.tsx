import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Icon, Color, Text, Container } from '@wings-software/uicore'
import { PageSpinner } from '@common/components/Page/PageSpinner'

import {
  GitSyncEntityListDTO,
  GitSyncEntityDTO,
  PageGitSyncEntityListDTO,
  useListGitSyncEntitiesByType,
  GitSyncProductDTO
} from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { getEntityHeaderText, getTableColumns } from './EntityHelper'
import i18n from './GitSyncEntityTab.i18n'
import css from './GitSyncEntity.module.scss'

interface EntitiesListingProps {
  selectedProduct: GitSyncProductDTO['moduleType']
  entityType: GitSyncEntityListDTO['entityType']
  backToSummary: Function
}

interface EntityListViewProps {
  data: PageGitSyncEntityListDTO | undefined
  gotoPage: (pageNumber: number) => void
  refetch: Function
}

const EntityListView: React.FC<EntityListViewProps> = props => {
  const data = props.data?.content?.[0]

  return (
    <>
      {data ? (
        <Text margin="large" font={{ size: 'medium', weight: 'bold' }} color={Color.DARK_600}>
          {getEntityHeaderText(data)}
        </Text>
      ) : null}
      <Table<GitSyncEntityDTO>
        className={css.table}
        columns={getTableColumns(false)}
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
    </>
  )
}

const EntitiesListing: React.FC<EntitiesListingProps> = props => {
  const { accountId } = useParams()
  const [page, setPage] = useState(0)

  const { loading: loadingEntityList, data: dataAllEntities, refetch } = useListGitSyncEntitiesByType({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    entityType: props.entityType!,
    queryParams: { accountId, page: page, size: 10 }
  })

  if (loadingEntityList) {
    return <PageSpinner />
  }

  return (
    <Container padding="small" className={css.productListing}>
      <Text padding="xlarge" color={Color.BLUE_500} background={Color.WHITE} onClick={() => props.backToSummary()}>
        <Icon name="chevron-left" margin={{ right: 'small' }} size={20} />
        {i18n.back}
      </Text>
      <EntityListView
        data={dataAllEntities?.data}
        refetch={refetch}
        gotoPage={pageNumber => setPage(pageNumber)}
      ></EntityListView>
    </Container>
  )
}

export default EntitiesListing
