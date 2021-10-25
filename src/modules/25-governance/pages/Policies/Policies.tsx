import React, { useState, useMemo } from 'react'
import * as moment from 'moment'
import { ButtonVariation, Layout, Button, Text, Color, Utils, PageHeader } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps, Renderer, Column } from 'react-table'
import { useStrings } from 'framework/strings'
import { useToaster, useConfirmationDialog, Page, StringUtils } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { Policy, useDeletePolicy, useGetPolicyList } from 'services/pm'
import { OptionsMenuButton } from '@common/components'
import routes from '@common/RouteDefinitions'
import Table from '@common/components/Table/Table'
import PolicyIcon from './Policy.svg'

import css from './Policies.module.scss'

const PAGE_SIZE = 15

const _useGetPolicyList = useGetPolicyList as any

const Policies: React.FC = () => {
  const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  useDocumentTitle(getString('common.policies'))
  const [pageIndex, setPageIndex] = useState(0)
  // const [searchTerm, setsearchTerm] = useState<string>('')
  const queryParams = useMemo(
    () => ({
      accountId,
      per_page: PAGE_SIZE,
      page: pageIndex
    }),
    [accountId, pageIndex]
  )

  const {
    data: policyList,
    loading: fetchingPolicies,
    error,
    refetch,
    response
  } = _useGetPolicyList({
    queryParams
  })
  const itemCount = useMemo(() => parseInt(response?.headers?.get('x-total-items') || 0), [response])
  const pageCount = useMemo(() => parseInt(response?.headers?.get('x-total-pages') || 0), [response])
  const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || 0), [response])
  const history = useHistory()

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

  const RenderPolicyName: Renderer<CellProps<Policy>> = ({ row }) => {
    const record = row.original
    return (
      <Layout.Horizontal spacing="small" flex style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <img src={PolicyIcon} height="22" />
        <Text color={Color.BLACK} lineClamp={1} font={{ weight: 'semi-bold' }}>
          {record.name}
        </Text>
      </Layout.Horizontal>
    )
  }

  const getValue = (value: number) => {
    return value ? moment.unix(value / 1000).format(StringUtils.DEFAULT_DATE_FORMAT) : null
  }

  const RenderCreatedAt: Renderer<CellProps<Policy>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.created || 0)}
      </Text>
    )
  }

  const RenderLastUpdated: Renderer<CellProps<Policy>> = ({ row }) => {
    const record = row.original
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getValue(record.updated || 0)}
      </Text>
    )
  }

  const RenderColumnMenu: Renderer<CellProps<Policy>> = ({ row }) => {
    const data = row
    const { showSuccess, showError } = useToaster()
    const { mutate: deletePolicy } = useDeletePolicy({})
    const { openDialog: openDeleteDialog } = useConfirmationDialog({
      contentText: getString('governance.deleteConfirmation', { name: data.original.name }),
      titleText: getString('governance.deleteTitle'),
      confirmButtonText: getString('delete'),
      cancelButtonText: getString('cancel'),
      onCloseDialog: async didConfirm => {
        if (didConfirm && data) {
          try {
            await deletePolicy(data.original.identifier as string)
            showSuccess(getString('governance.deleteDone', { name: data.original.name }))
            refetch()
          } catch (err) {
            showError(err?.message)
          }
        }
      }
    })

    return (
      <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} onClick={Utils.stopEvent}>
        <OptionsMenuButton
          items={[
            {
              icon: 'edit',
              text: getString('edit'),
              onClick: () => {
                history.push(routes.toPolicyEditPage({ accountId, policyIdentifier: String(data?.id || '') }))
              }
            },
            {
              icon: 'trash',
              text: getString('delete'),
              onClick: openDeleteDialog
            }
          ]}
        />
      </Layout.Horizontal>
    )
  }

  const columns: Column<Policy>[] = useMemo(
    () => [
      {
        Header: getString('common.policy.table.name'),

        accessor: row => row.name,
        width: '45%',
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
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.identifier,
        width: '5%',
        Cell: RenderColumnMenu,

        disableSortBy: true
      }
    ],
    []
  )

  return (
    <>
      <PageHeader
        title={<Layout.Horizontal>{newUserGroupsBtn()}</Layout.Horizontal>}
        // toolbar={
        //   <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
        //     <ExpandingSearchInput
        //       alwaysExpanded
        //       placeholder={getString('common.policy.policySearch')}
        //       onChange={text => {
        //         setsearchTerm(text.trim())
        //         setPage(0)
        //       }}
        //       width={250}
        //     />
        //   </Layout.Horizontal>
        // }
      />
      <Page.Body
        loading={fetchingPolicies}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={{
          when: () => !policyList?.length,
          icon: 'nav-project',
          message: getString('common.policy.noPolicy'),
          button: newUserGroupsBtn()
        }}
      >
        <Table<Policy>
          className={css.table}
          columns={columns}
          data={policyList || []}
          onRowClick={data => {
            history.push(routes.toPolicyEditPage({ accountId, policyIdentifier: String(data?.identifier || '') }))
          }}
          // TODO: enable when page is ready

          pagination={{
            itemCount,
            pageSize,
            pageCount,
            pageIndex,
            gotoPage: (index: number) => {
              setPageIndex(index)
            }
          }}
        />
      </Page.Body>
    </>
  )
}

export default Policies
