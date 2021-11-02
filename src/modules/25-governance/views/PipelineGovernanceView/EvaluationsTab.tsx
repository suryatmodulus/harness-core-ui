/* eslint-disable react/display-name */
import React, { useState, useMemo } from 'react'
import cx from 'classnames'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps, Column } from 'react-table'
import { get } from 'lodash-es'
import ReactTimeago from 'react-timeago'
import {
  Container,
  FontVariation,
  Layout,
  PageError,
  Text,
  IconName,
  Button,
  ButtonVariation,
  Intent
} from '@wings-software/uicore'
import { Evaluation, GetEvaluationListQueryParams, PolicySet, useGetEvaluationList } from 'services/pm'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import routes from '@common/RouteDefinitions'
import type { GovernancePathProps } from '@common/interfaces/RouteInterfaces'
import type { StringsContextValue } from 'framework/strings/StringsContext'
import { EvaluationStatusLabel } from '@governance/components/EvaluationStatus/EvaluationStatusLabel'
import { EvaluationStatus, PipleLineEvaluationEvent, LIST_FETCHING_PAGE_SIZE } from '@governance/utils/GovernanceUtils'
import css from './PipelineGovernanceView.module.scss'

const policyEvaluationActionIcon = (action?: string): IconName => {
  return action === PipleLineEvaluationEvent.ON_RUN ? 'run-pipeline' : 'send-data'
}

const evaluationNameFromAction = (getString: StringsContextValue['getString'], action?: string): string => {
  return getString?.(action === PipleLineEvaluationEvent.ON_RUN ? 'governance.onRun' : 'governance.onSave') || ''
}

export const EvaluationsTab: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0)
  const { accountId, orgIdentifier, projectIdentifier, pipelineIdentifier, module } = useParams<
    GovernancePathProps & { pipelineIdentifier: string }
  >()
  const entity = `accountIdentifier:${accountId}/orgIdentifier:${orgIdentifier}/projectIdentifier:${projectIdentifier}/pipelineIdentifier:${pipelineIdentifier}`
  const queryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      entity: encodeURIComponent(entity),
      per_page: String(LIST_FETCHING_PAGE_SIZE),
      include_hierarchy: true
    } as GetEvaluationListQueryParams
  }, [accountId, orgIdentifier, projectIdentifier, entity])
  const { data, loading, error, refetch /*, response */ } = useGetEvaluationList({ queryParams })
  const { getString } = useStrings()
  const columns: Column<Evaluation>[] = useMemo(
    () => [
      {
        Header: getString('governance.event').toLocaleUpperCase(),
        accessor: row => row.type,
        width: '65%',
        Cell: ({ row }: CellProps<Evaluation>) => (
          <Text
            icon={policyEvaluationActionIcon(row.original.action)}
            iconProps={{ padding: { right: 'small' } }}
            font={{ variation: FontVariation.BODY2 }}
          >
            {evaluationNameFromAction(getString, row.original.action)}
          </Text>
        )
      },
      {
        Header: getString('governance.evaluatedOn').toLocaleUpperCase(),
        accessor: row => row.created,
        width: '20%',
        Cell: ({ row }: CellProps<PolicySet>) => (
          <Text font={{ variation: FontVariation.BODY }}>
            <ReactTimeago date={row.original?.created || 0} />
          </Text>
        )
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: row => row.status,
        width: '15%',
        Cell: ({ row }: CellProps<Evaluation>) => {
          let policySetOutcomeIntent: Intent = Intent.DANGER
          let policySetOutcomeLabel = getString('failed')

          switch (row.original.status) {
            case EvaluationStatus.PASS:
              policySetOutcomeIntent = Intent.SUCCESS
              policySetOutcomeLabel = getString('success')
              break
            case EvaluationStatus.WARNING:
              policySetOutcomeIntent = Intent.WARNING
              policySetOutcomeLabel = getString('governance.warning')
              break
          }

          return <EvaluationStatusLabel intent={policySetOutcomeIntent} label={policySetOutcomeLabel.toUpperCase()} />
        }
      }
    ],
    [getString]
  )
  // const pageCount = useMemo(() => parseInt(response?.headers?.get('x-page-item-count') || '0'), [response])
  // const pageSize = useMemo(() => parseInt(response?.headers?.get('x-page-size') || '0'), [response])
  const history = useHistory()

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
            <Table<Evaluation>
              columns={columns}
              data={data || []}
              onRowClick={evaluation => {
                history.push(
                  routes.toGovernanceEvaluationDetail({
                    accountId,
                    orgIdentifier: evaluation.org_id,
                    projectIdentifier: evaluation.project_id,
                    module,
                    evaluationId: String(evaluation.id)
                  })
                )
              }}
            />
          </Container>
          <Container className={cx(css.pagination, css.forEvaluations)}>
            <Layout.Horizontal spacing="small">
              <Button
                variation={ButtonVariation.TERTIARY}
                icon="chevron-left"
                text={getString('previous')}
                disabled={!pageIndex}
                onClick={() => setPageIndex(pageIndex - 1)}
              />
              <Button
                variation={ButtonVariation.TERTIARY}
                icon="chevron-right"
                text={getString('next')}
                disabled={(data?.length || 0) < LIST_FETCHING_PAGE_SIZE}
                onClick={() => setPageIndex(pageIndex + 1)}
              />
            </Layout.Horizontal>
          </Container>
        </>
      )}
    </Container>
  )
}
