/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TableDashboardItem, TableData } from '@cv/components/MetricsDashboardList/MetricsDashboardList.type'

export function initializeTableData(
  selectedDashboards: Map<string, TableDashboardItem>,
  dashboards?: TableDashboardItem[]
): TableData[] {
  if (!dashboards) {
    return []
  }

  const tableData: TableData[] = []
  for (const dashboard of dashboards) {
    if (!dashboard || !dashboard.id || !dashboard.name) {
      continue
    }
    tableData.push({
      selected: selectedDashboards.has(dashboard.name),
      dashboard: dashboard
    })
  }
  return tableData
}

export function initializeSelectedDashboards<T>(
  items: T[],
  mapper: (item: T) => TableDashboardItem
): Map<string, TableDashboardItem> {
  if (!items?.length) {
    return new Map()
  }
  const tableDashboards = items.map(dashboard => mapper(dashboard))
  const selectedDashboards = new Map<string, TableDashboardItem>()
  for (const dashboard of tableDashboards) {
    if (dashboard?.name && dashboard.id) {
      selectedDashboards.set(dashboard.name, dashboard)
    }
  }
  return selectedDashboards
}
