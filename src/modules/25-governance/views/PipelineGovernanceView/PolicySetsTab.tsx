/* eslint-disable react/display-name */
import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps, Column } from 'react-table'
import { get } from 'lodash-es'
import ReactTimeago from 'react-timeago'
import { Container, FontVariation, PageError, Pagination, Text } from '@wings-software/uicore'
import { GetPolicySetListQueryParams, PolicySet, useGetPolicySetList } from 'services/pm'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import routes from '@common/RouteDefinitions'
import { LIST_FETCHING_PAGE_SIZE, PolicySetType } from '@governance/utils/GovernanceUtils'
import type { GovernancePathProps } from '@common/interfaces/RouteInterfaces'
import css from './PipelineGovernanceView.module.scss'

export const PolicySetsTab: React.FC<{ setPolicySetCount: React.Dispatch<React.SetStateAction<number>> }> = ({
  setPolicySetCount
}) => {
  const [pageIndex, setPageIndex] = useState(0)
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<GovernancePathProps>()
  const queryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      per_page: String(LIST_FETCHING_PAGE_SIZE),
      page: String(pageIndex),
      type: PolicySetType.PIPELINE
    } as GetPolicySetListQueryParams
  }, [accountId, orgIdentifier, projectIdentifier, pageIndex])
  const { data, loading, error, refetch, response } = useGetPolicySetList({
    queryParams
  })
  const { getString } = useStrings()
  const columns: Column<PolicySet>[] = useMemo(
    () => [
      {
        Header: getString('common.policiesSets.table.name'),
        accessor: row => row.name,
        width: '65%',
        Cell: ({ row }: CellProps<PolicySet>) => (
          <Text icon="governance" iconProps={{ padding: { right: 'small' } }} font={{ variation: FontVariation.BODY2 }}>
            {row.original.name}
          </Text>
        )
      },
      {
        Header: getString('common.policiesSets.table.enforced'),
        accessor: row => row.enabled,
        width: '15%',
        Cell: ({ row }: CellProps<PolicySet>) => (
          <Text
            font={{
              variation: row.original.enabled ? FontVariation.FORM_MESSAGE_SUCCESS : FontVariation.FORM_MESSAGE_DANGER
            }}
          >
            {row.original.enabled ? getString('yes') : getString('no')}
          </Text>
        )
      },
      {
        Header: getString('common.policy.table.lastModified'),
        accessor: row => row.updated,
        width: '20%',
        Cell: ({ row }: CellProps<PolicySet>) => (
          <Text font={{ variation: FontVariation.BODY }}>
            <ReactTimeago date={row.original?.updated || 0} />
          </Text>
        )
      }
    ],
    [getString]
  )
  const itemCount = useMemo(() => parseInt(response?.headers?.get('x-total-items') || '0'), [response])
  const pageCount = useMemo(() => parseInt(response?.headers?.get('x-total-pages') || '0'), [response])
  const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || '0'), [response])
  const history = useHistory()

  useEffect(() => {
    if (itemCount) {
      setPolicySetCount(itemCount)
    }
  }, [itemCount, setPolicySetCount])

  return (
    <Container className={css.tabContent}>
      {loading && (
        <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
          <ContainerSpinner />
        </Container>
      )}
      {error && (
        <PageError
          message={get(error, 'data.error', get(error, 'data.message', error?.message))}
          onClick={() => refetch()}
        />
      )}
      {!loading && !error && (
        <>
          <Container className={css.tableContainer}>
            <Table<PolicySet>
              columns={columns}
              data={data || []}
              onRowClick={policySet => {
                // Policy Set detail page is not yet ready (no design)
                // history.push(routes.toPolicySetDetail({ accountId, policySetIdentifier: policySet.identifier as string }))
                history.push(
                  routes.toGovernancePolicySetsListing({
                    accountId,
                    orgIdentifier: policySet.org_id,
                    projectIdentifier: policySet.project_id,
                    module
                  })
                )
              }}
            />
          </Container>
          <Container className={css.pagination}>
            <Pagination
              itemCount={itemCount}
              pageSize={pageSize}
              pageCount={pageCount}
              pageIndex={pageIndex}
              gotoPage={index => {
                setPageIndex(index)
              }}
            />
          </Container>
        </>
      )}
    </Container>
  )
}
