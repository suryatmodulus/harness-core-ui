/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import moment from 'moment'
import ReactTimeago from 'react-timeago'
import { Intent } from '@blueprintjs/core'
import {
  Color,
  Container,
  ExpandingSearchInput,
  FlexExpander,
  Layout,
  Pagination,
  TableV2,
  Text
} from '@wings-software/uicore'
import type { Cell, Column } from 'react-table'
import { ListingPageTemplate } from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import {
  CF_DEFAULT_PAGE_SIZE,
  getErrorMessage,
  rewriteCurrentLocationWithActiveEnvironment,
  SEGMENT_PRIMARY_COLOR,
  showToaster
} from '@cf/utils/CFUtils'
import { useConfirmAction } from '@common/hooks'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import {
  makeStackedCircleShortName,
  StackedCircleContainer
} from '@cf/components/StackedCircleContainer/StackedCircleContainer'
import { NoEnvironment } from '@cf/components/NoEnvironment/NoEnvironment'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import { GetAllSegmentsQueryParams, Segment, useDeleteSegment, useGetAllSegments } from 'services/cf'
import TargetManagementHeader from '@cf/components/TargetManagementHeader/TargetManagementHeader'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import UsageLimitBanner from '@cf/components/UsageLimitBanner/UsageLimitBanner'
import { NoSegmentsView } from './NoSegmentsView'
import { NewSegmentButton } from './NewSegmentButton'

export const SegmentsPage: React.FC = () => {
  const { activeEnvironment, withActiveEnvironment } = useActiveEnvironment()
  const {
    EnvironmentSelect,
    loading: loadingEnvironments,
    error: errEnvironments,
    refetch: refetchEnvs,
    environments
  } = useEnvironmentSelectV2({
    selectedEnvironmentIdentifier: activeEnvironment,
    onChange: (_value, _environment, _userEvent) => {
      rewriteCurrentLocationWithActiveEnvironment(_environment)
    }
  })
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const [pageNumber, setPageNumber] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const queryParams = useMemo(
    () => ({
      project: projectIdentifier,
      environment: activeEnvironment,
      pageNumber,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      name: searchTerm
    }),
    [accountId, orgIdentifier, projectIdentifier, activeEnvironment, pageNumber, searchTerm] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const {
    data: segmentsData,
    loading: loadingSegments,
    error: errSegments,
    refetch: refetchSegments
  } = useGetAllSegments({
    queryParams,
    lazy: !activeEnvironment
  })
  const history = useHistory()
  const onSearchInputChanged = useCallback(
    name => {
      setSearchTerm(name)
      refetchSegments({ queryParams: { ...queryParams, name } as GetAllSegmentsQueryParams })
    },
    [setSearchTerm, refetchSegments, queryParams]
  )
  const loading = loadingEnvironments || loadingSegments
  const error = errEnvironments || errSegments
  const noSegmentExists = segmentsData?.segments?.length === 0
  const noEnvironmentExists = !loadingEnvironments && environments?.length === 0
  const title = getString('cf.shared.segments')

  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const gotoSegmentDetailPage = useCallback(
    (identifier: string): void => {
      history.push(
        withActiveEnvironment(
          routes.toCFSegmentDetails({
            segmentIdentifier: identifier as string,
            projectIdentifier,
            orgIdentifier,
            accountId
          })
        )
      )
    },
    [history, accountId, orgIdentifier, projectIdentifier, withActiveEnvironment]
  )
  const toolbar = (
    <Layout.Horizontal spacing="medium">
      <NewSegmentButton
        accountId={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        onCreated={segmentIdentifier => {
          gotoSegmentDetailPage(segmentIdentifier)
          showToaster(getString('cf.messages.segmentCreated'))
        }}
      />
      <Text font={{ size: 'small' }} color={Color.GREY_400} style={{ alignSelf: 'center' }}>
        {getString('cf.segments.pageDescription')}
      </Text>
      <FlexExpander />
      <ExpandingSearchInput name="findFlag" placeholder={getString('search')} onChange={onSearchInputChanged} />
    </Layout.Horizontal>
  )
  const { showError, clear } = useToaster()
  const deleteSegmentParams = useMemo(
    () => ({
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: activeEnvironment
    }),
    [accountId, orgIdentifier, projectIdentifier, activeEnvironment] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const { mutate: deleteSegment } = useDeleteSegment({
    queryParams: deleteSegmentParams
  })
  const columns: Column<Segment>[] = useMemo(
    () => [
      {
        Header: getString('cf.shared.segment').toUpperCase(),
        id: 'name',
        accessor: 'name',
        width: '35%',
        Cell: function NameCell(cell: Cell<Segment>) {
          const description = (cell.row.original as { description?: string })?.description

          return (
            <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
              <StackedCircleContainer
                items={[{ name: cell.row.original.name, identifier: cell.row.original.identifier }]}
                keyOfItem={item => item.identifier}
                renderItem={item => <Text>{makeStackedCircleShortName(item.name)}</Text>}
                backgroundColor={() => SEGMENT_PRIMARY_COLOR}
                margin={{ right: 'small' }}
              />
              <Container>
                <Text style={{ fontWeight: 600, lineHeight: '24px', color: '#22222A' }}>{cell.row.original.name}</Text>
                {description && <Text>{description}</Text>}
              </Container>
            </Layout.Horizontal>
          )
        }
      },
      {
        Header: getString('identifier').toUpperCase(),
        id: 'identifier',
        accessor: 'identifier',
        width: '35%',
        Cell: function IdCell(cell: Cell<Segment>) {
          return <Text>{cell.row.original.identifier}</Text>
        }
      },
      {
        Header: getString('cf.targets.createdDate').toUpperCase(),
        id: 'createdAt',
        accessor: 'createdAt',
        width: '30%',
        Cell: function CreateAtCell(cell: Cell<Segment>) {
          const deleteSegmentConfirm = useConfirmAction({
            title: getString('cf.segments.delete.title'),
            message: (
              <Text>
                <span
                  dangerouslySetInnerHTML={{
                    __html: getString('cf.segments.delete.message', { segmentName: cell.row.original.name })
                  }}
                />
              </Text>
            ),
            intent: Intent.DANGER,
            action: async () => {
              clear()

              try {
                deleteSegment(cell.row.original.identifier as string)
                  .then(() => {
                    refetchSegments()
                    showToaster(getString('cf.messages.segmentDeleted'))
                  })
                  .catch(_error => {
                    showError(getErrorMessage(_error), 0, 'cf.delete.segment.error')
                  })
              } catch (err) {
                showError(getErrorMessage(err), 0, 'cf.delete.segment.error')
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
                <RbacOptionsMenuButton
                  items={[
                    {
                      icon: 'edit',
                      text: getString('edit'),
                      onClick: () => {
                        gotoSegmentDetailPage(cell.row.original.identifier as string)
                      },
                      permission: {
                        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
                        permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
                      }
                    },
                    {
                      icon: 'trash',
                      text: getString('delete'),
                      onClick: deleteSegmentConfirm,
                      permission: {
                        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
                        permission: PermissionIdentifier.DELETE_FF_TARGETGROUP
                      }
                    }
                  ]}
                />
              </Container>
            </Layout.Horizontal>
          )
        }
      }
    ],
    [getString, clear, deleteSegment, gotoSegmentDetailPage, showError, refetchSegments]
  )

  useEffect(() => {
    return () => {
      clear()
    }
  }, [clear])

  const content = noEnvironmentExists ? (
    <Container flex={{ align: 'center-center' }} height="100%">
      <NoEnvironment
        onCreated={response => {
          const { location } = window
          location.replace(`${location.href}?activeEnvironment=${response?.data?.identifier}`)
          refetchEnvs()
        }}
      />
    </Container>
  ) : noSegmentExists ? (
    <NoSegmentsView
      hasEnvironment={!!environments?.length}
      onNewSegmentCreated={segmentIdentifier => {
        gotoSegmentDetailPage(segmentIdentifier)
        showToaster(getString('cf.messages.segmentCreated'))
      }}
    />
  ) : (
    <>
      {isPlanEnforcementEnabled && <UsageLimitBanner />}
      <Container padding={{ top: 'medium', right: 'xxlarge', left: 'xxlarge' }}>
        <TableV2<Segment>
          columns={columns}
          data={segmentsData?.segments || []}
          onRowClick={segment => {
            gotoSegmentDetailPage(segment.identifier as string)
          }}
        />
      </Container>
    </>
  )

  return (
    <ListingPageTemplate
      pageTitle={title}
      header={
        <TargetManagementHeader environmentSelect={<EnvironmentSelect />} hasEnvironments={!!environments?.length} />
      }
      headerStyle={{ display: 'flex' }}
      toolbar={!noEnvironmentExists && toolbar}
      content={((!error || noEnvironmentExists) && content) || null}
      pagination={
        !noEnvironmentExists &&
        !!segmentsData?.segments?.length && (
          <Pagination
            itemCount={segmentsData?.itemCount || 0}
            pageSize={segmentsData?.pageSize || 0}
            pageCount={segmentsData?.pageCount || 0}
            pageIndex={pageNumber}
            gotoPage={index => {
              setPageNumber(index)
            }}
          />
        )
      }
      loading={loading}
      error={noEnvironmentExists ? undefined : error}
      retryOnError={() => {
        refetchEnvs()
        refetchSegments()
      }}
    />
  )
}
