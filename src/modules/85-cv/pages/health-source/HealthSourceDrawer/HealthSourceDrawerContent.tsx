/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { useStrings } from 'framework/strings'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { DatadogProduct } from '../connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'
import { SelectDatadogMetricsDashboards } from '../connectors/DatadogMetricsHealthSource/components/SelectDatadogMetricsDashboards/SelectDatadogMetricsDashboards'
import DefineHealthSource from './component/defineHealthSource/DefineHealthSource'
import CustomiseHealthSource from './component/customiseHealthSource/CustomiseHealthSource'
import { createHealthSourceDrawerFormData } from './HealthSourceDrawerContent.utils'
import type { HealthSourceDrawerInterface } from './HealthSourceDrawerContent.types'
import { GCOProduct } from '../connectors/GCOLogsMonitoringSource/GoogleCloudOperationsMonitoringSourceUtils'
import { SelectGCODashboards } from '../connectors/GCOMetricsHealthSource/components/SelectGCODashboards/SelectGCODashboards'
import { getSelectedFeature } from './component/defineHealthSource/DefineHealthSource.utils'

function HealthSourceDrawerContent({
  serviceRef,
  environmentRef,
  monitoredServiceRef,
  onSuccess,
  isEdit,
  rowData,
  tableData,
  shouldRenderAtVerifyStep,
  changeSources,
  metricDetails
}: HealthSourceDrawerInterface): JSX.Element {
  const { getString } = useStrings()

  const sourceData = useMemo(
    () =>
      createHealthSourceDrawerFormData({
        isEdit,
        monitoredServiceRef,
        serviceRef,
        environmentRef,
        tableData,
        rowData,
        changeSources,
        existingMetricDetails: metricDetails
      }),
    [rowData, tableData, monitoredServiceRef, serviceRef, environmentRef, isEdit, changeSources]
  )

  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(getSelectedFeature(sourceData)?.value)
  const [tabTitles, ...tabs] = useMemo(() => {
    if (selectedProduct === GCOProduct.CLOUD_METRICS || selectedProduct === DatadogProduct.CLOUD_METRICS) {
      const dashboardsScreen =
        selectedProduct === DatadogProduct.CLOUD_METRICS ? (
          <SelectDatadogMetricsDashboards key="selectDatadogDashboards" />
        ) : (
          <SelectGCODashboards key="selectGCODashboards" />
        )
      return [
        [
          getString('cv.healthSource.defineHealthSource'),
          getString('cv.healthSource.connectors.gco.selectDashboardTab'),
          getString('cv.healthSource.customizeHealthSource')
        ],
        <DefineHealthSource
          key="defineHealthSource"
          onSubmit={values => {
            setSelectedProduct(values.product?.value)
          }}
        />,
        dashboardsScreen,
        <CustomiseHealthSource
          key="customiseHealthSource"
          onSuccess={onSuccess}
          shouldRenderAtVerifyStep={shouldRenderAtVerifyStep}
        />
      ]
    }
    return [
      [getString('cv.healthSource.defineHealthSource'), getString('cv.healthSource.customizeHealthSource')],
      <DefineHealthSource key="defineHealthSource" onSubmit={values => setSelectedProduct(values.product?.value)} />,
      <CustomiseHealthSource
        key="customiseHealthSource"
        onSuccess={onSuccess}
        shouldRenderAtVerifyStep={shouldRenderAtVerifyStep}
      />
    ]
  }, [selectedProduct])

  const determineMaxTabBySourceType = useCallback(() => {
    switch (selectedProduct) {
      case GCOProduct.CLOUD_METRICS:
        return 2
      default:
        return 1
    }
  }, [selectedProduct])

  return (
    <>
      <SetupSourceTabs
        data={sourceData}
        determineMaxTab={isEdit ? determineMaxTabBySourceType : undefined}
        tabTitles={tabTitles}
      >
        {tabs}
      </SetupSourceTabs>
    </>
  )
}

export default HealthSourceDrawerContent
