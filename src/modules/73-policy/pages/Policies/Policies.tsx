import React, { useState, useEffect, useMemo } from 'react'
import * as moment from 'moment'
import { ButtonVariation, ExpandingSearchInput, Layout, Button, Text, Color } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { useGet } from 'restful-react'
import type { CellProps, Renderer, Column } from 'react-table'
import { useStrings } from 'framework/strings'
import { StringUtils } from '@common/exports'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { setPageNumber } from '@common/utils/utils'
import routes from '@common/RouteDefinitions'
import Table from '@common/components/Table/Table'

import css from './Policies.module.scss'

export interface PoliciesDTO {
  account_id?: number
  created: number
  id: number
  name: string
  org_id?: string
  project_id?: string
  rego: string
  updated: number
}

const Policies: React.FC = () => {
  const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  useDocumentTitle(getString('common.policies'))
  const [page, setPage] = useState(0)
  const [searchTerm, setsearchTerm] = useState<string>('')
  const {
    data: policyList,
    loading: fetchingPolicies,
    error,
    refetch
  } = useGet({
    path: 'pm/api/v1/policies',
    queryParams: {
      accountId: accountId
    }
  })
  const history = useHistory()

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: policyList?.pageCount || 1000 })
  }, [policyList, page])

  const newUserGroupsBtn = (): JSX.Element => {
    const pathname = routes.toPolicyNewPage({ accountId })

    return (
      <Button
        text={getString('common.policy.newPolicy')}
        variation={ButtonVariation.PRIMARY}
        icon="plus"
        onClick={() => {
          history.push({ pathname })
        }}
      />
    )
  }

  const RenderPolicyName: Renderer<CellProps<PoliciesDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {record.name}
      </Text>
    )
  }

  const getValue = (value: number) => {
    return value ? moment.unix(value / 1000).format(StringUtils.DEFAULT_DATE_FORMAT) : null
  }

  const RenderCreatedAt: Renderer<CellProps<PoliciesDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.created)}
      </Text>
    )
  }

  const RenderLastUpdated: Renderer<CellProps<PoliciesDTO>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.updated)}
      </Text>
    )
  }

  const columns: Column<PoliciesDTO>[] = useMemo(
    () => [
      {
        Header: getString('common.policy.table.name'),

        accessor: row => row.name,
        width: '50%',
        Cell: RenderPolicyName
      },
      {
        Header: getString('common.policy.table.createdAt'),

        accessor: row => row.updated,
        width: '25%',
        Cell: RenderCreatedAt
      },
      {
        Header: getString('common.policy.table.lastModified'),

        accessor: row => row.updated,
        width: '25%',
        Cell: RenderLastUpdated
      }
    ],
    []
  )

  return (
    <>
      <PageHeader
        title={<Layout.Horizontal>{newUserGroupsBtn()}</Layout.Horizontal>}
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              alwaysExpanded
              placeholder={getString('common.policy.policySearch')}
              onChange={text => {
                setsearchTerm(text.trim())
                setPage(0)
              }}
              width={250}
            />
          </Layout.Horizontal>
        }
      />
      <Page.Body
        loading={fetchingPolicies}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={
          !searchTerm
            ? {
                when: () => !policyList?.length,
                icon: 'nav-project',
                message: getString('common.policy.noPolicy'),
                button: newUserGroupsBtn()
              }
            : {
                when: () => !policyList?.length,
                icon: 'nav-project',
                message: getString('common.policy.noPolicyResult')
              }
        }
      >
        <Table<PoliciesDTO>
          className={css.table}
          columns={columns}
          data={policyList || []}
          // TODO: enable when page is ready

          pagination={{
            itemCount: policyList?.length || 0,
            pageSize: policyList?.pageSize || 1000,
            pageCount: policyList?.pageCount || 0,
            pageIndex: policyList?.pageIndex || 0,
            gotoPage: (pageNumber: number) => setPage(pageNumber)
          }}
        />
      </Page.Body>
    </>
  )
}

export default Policies
