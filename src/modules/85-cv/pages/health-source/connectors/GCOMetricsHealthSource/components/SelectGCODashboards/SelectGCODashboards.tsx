/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Color, Container, Text, Utils, PageError, NoDataCard, TableV2 } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { Classes } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { StackdriverDashboardDTO, useGetStackdriverDashboards } from 'services/cv'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { ManualInputQueryModal } from '../ManualInputQueryModal/ManualInputQueryModal'
import {
  getManuallyCreatedQueries,
  transformGCOMetricHealthSourceToGCOMetricSetupSource
} from '../../GCOMetricsHealthSource.utils'
import css from './SelectGCODashboards.module.scss'

type TableData = {
  selected: boolean
  dashboard: StackdriverDashboardDTO
}

const TOTAL_ITEMS_PER_PAGE = 7

function initializeTableData(
  selectedDashboards: Map<string, StackdriverDashboardDTO>,
  dashboards?: StackdriverDashboardDTO[]
): TableData[] {
  if (!dashboards) return []

  const tableData: TableData[] = []
  for (const dashboard of dashboards) {
    if (!dashboard || !dashboard.path || !dashboard.name) continue
    tableData.push({
      selected: selectedDashboards.has(dashboard.name),
      dashboard: dashboard
    })
  }

  return tableData
}

function initializeSelectedDashboards(dashboards?: StackdriverDashboardDTO[]): Map<string, StackdriverDashboardDTO> {
  if (!dashboards?.length) {
    return new Map()
  }

  const selectedDashboards = new Map<string, StackdriverDashboardDTO>()
  for (const dashboard of dashboards) {
    if (dashboard?.name && dashboard.path) {
      selectedDashboards.set(dashboard.name, dashboard)
    }
  }

  return selectedDashboards
}

export function SelectGCODashboards(): JSX.Element {
  const { onNext, onPrevious, sourceData: propsData } = useContext(SetupSourceTabsContext)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [{ pageOffset, filteredDashboard }, setFilterAndPageOffset] = useState<{
    pageOffset: number
    filteredDashboard?: string
  }>({
    pageOffset: 0,
    filteredDashboard: undefined
  })
  const queryParams = useMemo(
    () => ({
      accountId,
      projectIdentifier,
      orgIdentifier,
      connectorIdentifier: (propsData?.connectorRef as string) || '',
      pageSize: TOTAL_ITEMS_PER_PAGE,
      offset: pageOffset,
      tracingId: Utils.randomId(),
      filter: filteredDashboard
    }),
    [filteredDashboard, propsData?.connectorRef, pageOffset, accountId, projectIdentifier, orgIdentifier]
  )
  const {
    data,
    loading,
    error,
    refetch: refetchDashboards
  } = useGetStackdriverDashboards({
    queryParams
  })
  const [selectedDashboards, setSelectedDashboards] = useState<Map<string, StackdriverDashboardDTO>>(
    initializeSelectedDashboards(
      propsData.selectedDashboards || transformGCOMetricHealthSourceToGCOMetricSetupSource(propsData).selectedDashboards
    )
  )
  const [tableData, setTableData] = useState<TableData[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (loading) {
      const loadingItems = Array<TableData>(TOTAL_ITEMS_PER_PAGE).fill(
        { selected: false, dashboard: { name: getString('loading') } },
        0,
        TOTAL_ITEMS_PER_PAGE
      )
      setTableData(loadingItems)
    } else {
      setTableData(initializeTableData(selectedDashboards, data?.data?.content))
    }
  }, [data, loading])

  const { content, pageIndex = -1, totalItems = 0, totalPages = 0, pageSize = 0 } = data?.data || {}
  return (
    <SetupSourceLayout
      content={
        <Container className={css.main}>
          <TableFilter
            appliedFilter={filteredDashboard}
            className={css.filterStyle}
            placeholder={getString('cv.monitoringSources.gco.searchForDashboardsPlaceholder')}
            onFilter={(filterValue: string) =>
              setFilterAndPageOffset({ pageOffset: 0, filteredDashboard: filterValue })
            }
          />
          <TableV2<TableData>
            data={tableData || []}
            onRowClick={(rowData, index) => {
              const newTableData = [...tableData]
              newTableData[index].selected = !rowData.selected
              setTableData(newTableData)
              if (newTableData[index].selected) {
                selectedDashboards.set(rowData.dashboard.name || '', rowData.dashboard)
              } else {
                selectedDashboards.delete(rowData.dashboard.name || '')
              }
              setSelectedDashboards(new Map(selectedDashboards))
            }}
            pagination={{
              pageSize: pageSize || 0,
              pageIndex: pageIndex,
              pageCount: totalPages,
              itemCount: totalItems,
              gotoPage: newPageIndex => setFilterAndPageOffset({ pageOffset: newPageIndex, filteredDashboard })
            }}
            columns={[
              {
                Header: '',
                accessor: 'selected',
                width: '10%',
                disableSortBy: true,
                Cell: function CheckColumn(tableProps: CellProps<TableData>) {
                  const { original, index } = tableProps.row
                  return loading ? (
                    <Container height={16} width={16} className={Classes.SKELETON} />
                  ) : (
                    <input
                      type="checkbox"
                      checked={tableProps.value}
                      onChange={() => {
                        const newTableData = [...tableData]
                        newTableData[index].selected = !tableProps.value
                        setTableData(newTableData)
                        if (newTableData[index].selected) {
                          selectedDashboards.set(original.dashboard.name || '', original.dashboard)
                        } else {
                          selectedDashboards.delete(original.dashboard.name || '')
                        }
                        setSelectedDashboards(new Map(selectedDashboards))
                      }}
                    />
                  )
                }
              },
              {
                Header: (
                  <Container className={css.columnContainer}>
                    <Text intent="primary" onClick={() => setIsModalOpen(true)} className={css.manualQueryLink}>
                      {getString('cv.monitoringSources.gco.addManualInputQuery')}
                    </Text>
                    <Text color={Color.BLACK}>
                      {getString('cv.monitoringSources.gco.selectDashboardsPage.dashboardColumnName')}
                    </Text>
                  </Container>
                ),
                accessor: 'dashboard',
                width: '90%',
                disableSortBy: true,
                Cell: function DashboardName(cellProps: CellProps<TableData>) {
                  return loading ? (
                    <Container height={16} width="100%" className={Classes.SKELETON} />
                  ) : (
                    <Text icon="service-stackdriver" color={Color.BLACK}>
                      {cellProps.value.name}
                    </Text>
                  )
                }
              }
            ]}
          />
          {!loading && error?.data && (
            <PageError
              className={css.loadingErrorNoData}
              message={getErrorMessage(error)}
              onClick={() => refetchDashboards({ queryParams: { ...queryParams, tracingId: Utils.randomId() } })}
            />
          )}
          {!loading && !error?.data && !content?.length && (
            <NoDataCard
              icon="warning-sign"
              className={css.loadingErrorNoData}
              message={getString('cv.monitoringSources.gco.selectDashboardsPage.noDataText')}
              buttonText={getString('cv.monitoringSources.gco.addManualInputQuery')}
              onClick={() => setIsModalOpen(true)}
            />
          )}
          {isModalOpen && (
            <ManualInputQueryModal
              manuallyInputQueries={getManuallyCreatedQueries(propsData.selectedMetrics)}
              onSubmit={values => {
                if (!propsData.selectedMetrics) {
                  propsData.selectedMetrics = new Map()
                }
                propsData.selectedMetrics.set(values.metricName, { isManualQuery: true, metricName: values.metricName })
                onNext({ ...propsData, selectedDashboards: Array.from(selectedDashboards.values()) })
              }}
              closeModal={() => setIsModalOpen(false)}
            />
          )}
        </Container>
      }
      footerCTAProps={{
        onNext: () => onNext({ ...propsData, selectedDashboards: Array.from(selectedDashboards.values()) }),
        onPrevious: onPrevious,
        className: css.footer
      }}
    />
  )
}
