import React, { useMemo, useState } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import type { Column, Renderer, CellProps } from 'react-table'
import { Text, Color, Layout, Icon, Button, Popover } from '@wings-software/uicore'

import Table from '@common/components/Table/Table'
import { SecretResponseWrapper, useDeleteSecretV2 } from 'services/cd-ng'
import type { PageSecretResponseWrapper, SecretTextSpecDTO } from 'services/cd-ng'
import { getStringForType } from '@secrets/utils/SSHAuthUtils'
import TagsPopover from '@common/components/TagsPopover/TagsPopover'
import { useStrings } from 'framework/exports'
import css from './SecretsReferencesList.module.scss'

interface SecretsListProps {
 //secrets?: PageSecretResponseWrapper //commented for Mock Test
  secrets?: any
  gotoPage: (pageNumber: number) => void
  refetch?: () => void
}

const RenderColumnEntity: Renderer<CellProps<any>> = ({ row }) => {
  const data = row.original.entity
  return (
    <Layout.Horizontal>
      <Layout.Vertical>
        <Layout.Horizontal spacing="small" width={230}>
          <Text color={Color.BLUE_500} lineClamp={1}>
            {data.name}
          </Text>
        </Layout.Horizontal>
        <Text color={Color.GREY_400} width={230} lineClamp={1}>
          {data.type}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const RenderColumnDetails: Renderer<CellProps<any>> = ({ row }) => {
  const data = row.original.details
  return (
    <>
     
        <Text color={Color.BLACK} inline>
          {data.key}
        </Text>:
        <Text color={Color.BLUE_500} inline>
          {data.value}
        </Text>
     
      
    </>
  )
}

const RenderColumnActivity: Renderer<CellProps<any>> = ({ row }) => {
  const data = row.original
  return data.lastActivity ? (
    <Layout.Horizontal spacing="small">
      <Icon name="activity" />
      <ReactTimeago date={data.lastActivity} />
    </Layout.Horizontal>
  ) : null
}




const SecretsReferencesList: React.FC<SecretsListProps> = ({ secrets, refetch, gotoPage }) => {
  const history = useHistory()
  const data: SecretResponseWrapper[] = useMemo(() => secrets?.content || [], [secrets?.content])
  const { pathname } = useLocation()
  const { getString } = useStrings()
  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: getString('entity').toUpperCase(),
        accessor: row => row.entity.name,
        id: 'name',
        width: '30%',
        Cell: RenderColumnEntity
      },
      {
        Header: getString('details').toUpperCase(),
        accessor: row => row.details.description,
        id: 'details',
        width: '25%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('lastActivity').toUpperCase(),
        accessor: 'lastActivity',
        id: 'activity',
        width: '20%',
        Cell: RenderColumnActivity
      }
      
    ],
    [refetch]
  )

  return (
    <Table<any>
      className={css.table}
      columns={columns}
      data={data}
      onRowClick={secret => {
        history.push(`${pathname}/${secret.secret?.identifier}`)
      }}
      pagination={{
        itemCount: secrets?.totalItems || 0,
        pageSize: secrets?.pageSize || 10,
        pageCount: secrets?.totalPages || -1,
        pageIndex: secrets?.pageIndex || 0,
        gotoPage
      }}
    />
  )
}

export default SecretsReferencesList
