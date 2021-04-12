import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import ReactTimeago from 'react-timeago'
import { Intent } from '@blueprintjs/core'
import { useHistory } from 'react-router-dom'
import { Button, Color, Container, FlexExpander, Layout, Pagination, Text } from '@wings-software/uicore'
import type { Cell, Column } from 'react-table'
import { ListingPageTemplate, ListingPageTitle } from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import { useEnvironments } from '@cf/hooks/environment'
import Table from '@common/components/Table/Table'
import {
  CF_DEFAULT_PAGE_SIZE,
  CF_LOCAL_STORAGE_ENV_KEY,
  DEFAULT_ENV,
  getErrorMessage,
  NO_ENVIRONMENT_IDENTIFIER,
  SEGMENT_PRIMARY_COLOR,
  showToaster,
  TARGET_PRIMARY_COLOR
} from '@cf/utils/CFUtils'
import { useConfirmAction, useLocalStorage } from '@common/hooks'
import { useStrings } from 'framework/exports'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import { OptionsMenuButton } from '@common/components'
import { EnvironmentSelect } from '@cf/components/EnvironmentSelect/EnvironmentSelect'
import type { GetEnvironmentListForProjectQueryParams } from 'services/cd-ng'
import { Segment, Target, useDeleteTarget, useGetAllTargets } from 'services/cf'
import {
  makeStackedCircleShortName,
  StackedCircleContainer
} from '@cf/components/StackedCircleContainer/StackedCircleContainer'
import { NoEnvironment } from '@cf/components/NoEnvironment/NoEnvironment'
import { NoTargetsView } from './NoTargetsView'
import { NewTargets } from './NewTarget'

export const TargetsPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const {
    data: environments,
    loading: loadingEnvironments,
    error: errEnvironments,
    refetch: refetchEnvs
  } = useEnvironments({
    projectIdentifier,
    accountIdentifier: accountId,
    orgIdentifier
  } as GetEnvironmentListForProjectQueryParams)
  const { getString } = useStrings()
  const [environment, setEnvironment] = useLocalStorage(CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV)
  const [pageNumber, setPageNumber] = useState(0)
  const queryParams = useMemo(
    () => ({
      account: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: (environment?.value || '') as string,
      pageNumber,
      pageSize: CF_DEFAULT_PAGE_SIZE
    }),
    [accountId, orgIdentifier, projectIdentifier, environment?.value, pageNumber]
  )
  const { data: targetsData, loading: loadingTargets, error: errTargets, refetch: refetchTargets } = useGetAllTargets({
    queryParams
  })
  const history = useHistory()
  const loading = loadingEnvironments || loadingTargets
  const error = errEnvironments || errTargets
  const noTargetExists = targetsData?.targets?.length === 0
  const noEnvironmentExists = environments?.length === 0
  const title = getString('cf.targets.title')
  const header = (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ flexGrow: 1 }} padding={{ right: 'xlarge' }}>
      <ListingPageTitle style={{ borderBottom: 'none' }}>{title}</ListingPageTitle>
      <FlexExpander />
      {!!environments?.length && (
        <EnvironmentSelect
          label={getString('cf.shared.environment').toLocaleUpperCase()}
          selectedEnvironment={environment?.value ? environment : environments[0]}
          environments={environments}
          onChange={({ label, value }) => setEnvironment({ label, value: value as string })}
        />
      )}
    </Layout.Horizontal>
  )
  const toolbar = (
    <Layout.Horizontal>
      <NewTargets
        accountId={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        environmentIdentifier={environment?.value}
        onCreated={() => {
          setPageNumber(0)
          refetchTargets({ queryParams: { ...queryParams, pageNumber: 0 } })
          showToaster(getString('cf.messages.targetCreated'))
        }}
      />
    </Layout.Horizontal>
  )
  const gotoTargeDetailPage = useCallback(
    (identifier: string): void => {
      history.push(
        routes.toCFTargetDetails({
          accountId,
          orgIdentifier,
          projectIdentifier,
          environmentIdentifier: environment.value || NO_ENVIRONMENT_IDENTIFIER,
          targetIdentifier: identifier as string
        })
      )
    },
    [history, accountId, orgIdentifier, projectIdentifier, environment.value]
  )
  const { showSuccess, showError, clear } = useToaster()
  const deleteTargetParams = useMemo(
    () => ({
      account: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: environment?.value
    }),
    [accountId, orgIdentifier, projectIdentifier, environment?.value]
  )
  const { mutate: deleteTarget } = useDeleteTarget({
    queryParams: deleteTargetParams
  })

  const columns: Column<Target>[] = useMemo(
    () => [
      {
        Header: getString('cf.shared.target').toUpperCase(),
        id: 'name',
        accessor: 'name',
        width: '40%',
        Cell: function NameCell(cell: Cell<Target>) {
          return (
            <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
              <StackedCircleContainer
                items={[{ name: cell.row.original.name, identifier: cell.row.original.identifier }]}
                keyOfItem={item => item.identifier}
                renderItem={item => <Text>{makeStackedCircleShortName(item.name)}</Text>}
                backgroundColor={() => TARGET_PRIMARY_COLOR}
                margin={{ right: 'small' }}
              />
              <Text color={Color.GREY_900}>{cell.row.original.name}</Text>
            </Layout.Horizontal>
          )
        }
      },
      {
        Header: getString('identifier').toUpperCase(),
        id: 'identifier',
        accessor: 'identifier',
        width: '15%',
        Cell: function IdCell(cell: Cell<Target>) {
          return <Text>{cell.row.original.identifier}</Text>
        }
      },
      {
        Header: getString('cf.shared.segments').toUpperCase(),
        id: 'targetSegment',
        accessor: 'attributes',
        width: '25%',
        Cell: function AttrCell(cell: Cell<Target & { segments: Segment[] }>) {
          return (
            <>
              {cell.row.original.segments?.length ? (
                <StackedCircleContainer
                  items={cell.row.original.segments}
                  keyOfItem={item => item.identifier}
                  renderItem={item => (
                    <Button noStyling tooltip={item.name}>
                      {makeStackedCircleShortName(item.name)}
                    </Button>
                  )}
                  renderOtherItem={otherItems => (
                    <Button
                      tooltip={
                        <Container padding="large">
                          {otherItems.map(item => (
                            <Text key={item.identifier}>{item.name}</Text>
                          ))}
                        </Container>
                      }
                      noStyling
                    >
                      +{otherItems.length}
                    </Button>
                  )}
                  backgroundColor={item => (item === true ? 'var(--blue-450)' : SEGMENT_PRIMARY_COLOR)}
                />
              ) : (
                <Text>{getString('cf.targets.noneDefined')}</Text>
              )}
            </>
          )
        }
      },
      {
        Header: getString('cf.targets.createdDate').toUpperCase(),
        id: 'createdAt',
        accessor: 'createdAt',
        width: '20%',
        Cell: function CreateAtCell(cell: Cell<Target>) {
          const deleteTargetConfirm = useConfirmAction({
            title: getString('cf.targets.deleteTarget'),
            message: (
              <Text>
                <span
                  dangerouslySetInnerHTML={{
                    __html: getString('cf.targets.deleteTargetMessage', { name: cell.row.original.name })
                  }}
                ></span>
              </Text>
            ),
            intent: Intent.DANGER,
            action: async () => {
              clear()

              try {
                deleteTarget(cell.row.original.identifier as string)
                  .then(() => {
                    refetchTargets()
                    showToaster(getString('cf.messages.targetDeleted'))
                  })
                  .catch(_error => {
                    showError(getErrorMessage(_error), 0)
                  })
              } catch (err) {
                showError(getErrorMessage(err), 0)
              }
            }
          })

          return (
            <Layout.Horizontal flex={{ distribution: 'space-between', align: 'center-center' }}>
              <Text>
                <ReactTimeago date={moment(cell.row.original.createdAt).toDate()} />
              </Text>
              <Container
                style={{ textAlign: 'right' }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                }}
              >
                <OptionsMenuButton
                  items={[
                    {
                      icon: 'edit',
                      text: getString('edit'),
                      onClick: () => {
                        gotoTargeDetailPage(cell.row.original.identifier as string)
                      }
                    },
                    {
                      icon: 'cross',
                      text: getString('delete'),
                      onClick: deleteTargetConfirm
                    }
                  ]}
                />
              </Container>
            </Layout.Horizontal>
          )
        }
      }
    ],
    [getString, clear, deleteTarget, gotoTargeDetailPage, refetchTargets, showError, showSuccess]
  )

  useEffect(() => {
    return () => {
      clear()
    }
  }, [clear])

  const content = noEnvironmentExists ? (
    <Container flex={{ align: 'center-center' }} height="100%">
      <NoEnvironment onCreated={() => refetchEnvs()} />
    </Container>
  ) : noTargetExists ? (
    <NoTargetsView
      environmentIdentifier={environment?.value}
      onNewTargetsCreated={() => {
        setPageNumber(0)
        refetchTargets({ queryParams: { ...queryParams, pageNumber: 0 } })
        showToaster(getString('cf.messages.targetCreated'))
      }}
      hasEnvironment={!!environments.length}
    />
  ) : (
    <Container padding={{ top: 'medium', right: 'xxlarge', left: 'xxlarge' }}>
      <Table<Target>
        columns={columns}
        data={targetsData?.targets || []}
        onRowClick={target => {
          gotoTargeDetailPage(target.identifier as string)
        }}
      />
    </Container>
  )

  return (
    <ListingPageTemplate
      pageTitle={title}
      header={header}
      headerStyle={{ display: 'flex' }}
      toolbar={!error && !noEnvironmentExists && !noTargetExists && toolbar}
      content={((!error || noEnvironmentExists) && content) || null}
      pagination={
        !noEnvironmentExists &&
        !!targetsData?.targets?.length && (
          <Pagination
            itemCount={targetsData?.itemCount || 0}
            pageSize={targetsData?.pageSize || 0}
            pageCount={targetsData?.pageCount || 0}
            pageIndex={pageNumber}
            gotoPage={index => {
              setPageNumber(index)
              refetchTargets({ queryParams: { ...queryParams, pageNumber: index } })
            }}
          />
        )
      }
      loading={loading}
      error={noEnvironmentExists ? undefined : error}
      retryOnError={() => {
        refetchEnvs()
        refetchTargets()
      }}
    />
  )
}
