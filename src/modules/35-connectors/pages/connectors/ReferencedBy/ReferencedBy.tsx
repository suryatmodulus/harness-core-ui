import React, { useMemo, useState } from 'react'
import ReactTimeago from 'react-timeago'
import { Layout, Text, Icon, Color, IconName } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import Table from '@common/components/Table/Table'

import {
  useListReferredByEntities,
  EntitySetupUsageDTO,
  ResponsePageEntitySetupUsageDTO,
  ListReferredByEntitiesQueryParams
} from 'services/cd-ng'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { Page } from '@common/exports'
import type { UseGetMockData } from '@common/utils/testUtils'
import { useStrings } from 'framework/strings'
import { getIconByEntityType, getReferredEntityLabelByType } from '../utils/ConnectorUtils'
import css from './ReferencedBy.module.scss'

interface ReferencedByProps {
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
  entityIdentifier: string | undefined
  entityType: ListReferredByEntitiesQueryParams['referredEntityType']
  mockData?: UseGetMockData<ResponsePageEntitySetupUsageDTO>
}

const RenderColumnEntity: Renderer<CellProps<EntitySetupUsageDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical>
      <Layout.Horizontal>
        <Icon
          name={getIconByEntityType(data.referredByEntity?.type || '') as IconName}
          size={16}
          className={css.secretIconCss}
        />
        <Text color={Color.BLACK} padding={{ left: 'small' }}>
          {data.referredByEntity?.name}
        </Text>
      </Layout.Horizontal>
      <Text color={Color.GREY_400} font={{ size: 'small' }} padding={{ left: 'xxlarge' }} margin={{ left: 'xsmall' }}>
        ({getReferredEntityLabelByType(data.referredByEntity?.type || '')})
      </Text>
    </Layout.Vertical>
  )
}

const RenderColumnActivity: Renderer<CellProps<EntitySetupUsageDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      {data.createdAt ? <ReactTimeago date={data.createdAt} /> : null}
    </Layout.Horizontal>
  )
}

const ReferencedBy: React.FC<ReferencedByProps> = props => {
  const [page, setPage] = useState(0)
  const { getString } = useStrings()
  const { data, loading, refetch } = useListReferredByEntities({
    queryParams: {
      accountIdentifier: props.accountId,
      projectIdentifier: props.projectIdentifier,
      orgIdentifier: props.orgIdentifier,
      identifier: props.entityIdentifier,
      referredEntityType: props.entityType,
      pageIndex: page,
      pageSize: 10
    },
    mock: props.mockData
  })

  const columns: Column<EntitySetupUsageDTO>[] = useMemo(
    () => [
      {
        Header: getString('entity').toUpperCase(),
        accessor: 'referredByEntity',
        width: '33%',
        Cell: RenderColumnEntity
      },
      {
        Header: getString('lastActivity').toUpperCase(),
        accessor: 'createdAt',
        width: '66%',
        Cell: RenderColumnActivity
      }
    ],
    [refetch]
  )
  return (
    <Layout.Vertical height={'calc(100vh - 64px'}>
      {/* Removing for now unless we have search enabled
       <Layout.Horizontal
        padding={{ top: 'large', bottom: 'large', left: 'large', right: 'large' }}
        height={72}
        border={{ bottom: true, color: Color.GREY_300 }}
        flex={{ distribution: 'space-between' }}
      > */}
      {/* <Text font={{ size: 'medium' }} color={Color.GREY_900}>
          {i18n.ReferencedBy}
        </Text> */}

      {/* TODO:  <TextInput
          leftIcon="search"
          placeholder="Search"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value.trim())
            }}
        /> */}
      {/* </Layout.Horizontal> */}
      {!loading ? (
        data?.data?.content?.length ? (
          <Table<EntitySetupUsageDTO>
            className={css.table}
            columns={columns}
            data={data.data.content || []}
            pagination={{
              itemCount: data.data?.totalElements || 0,
              pageSize: data.data?.size || 10,
              pageCount: data.data?.totalPages || -1,
              pageIndex: data.data?.pageable?.pageNumber || 0,
              gotoPage: pageNumber => setPage(pageNumber)
            }}
          />
        ) : (
          <Page.NoDataCard icon="nav-dashboard" message={getString('noReferencesData')} />
        )
      ) : (
        <PageSpinner />
      )}
    </Layout.Vertical>
  )
}
export default ReferencedBy
