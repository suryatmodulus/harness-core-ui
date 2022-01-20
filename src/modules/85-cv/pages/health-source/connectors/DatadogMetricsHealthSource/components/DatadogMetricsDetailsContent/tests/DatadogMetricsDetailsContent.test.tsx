/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import type { DatadogMetricInfo } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.type'
import type { NameIdDescriptionProps } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTagsConstants'
import type { DatadogMetricsDetailsContentProps } from '../DatadogMetricsDetailsContent.type'
import {
  MOCK_ACTIVE_METRIC,
  MockDatadogMetricInfo,
  MockDatadogMetricsHealthSource,
  MockMetricsContentProps
} from './mock'
import DatadogMetricsDetailsContent from '../DatadogMetricsDetailsContent'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

const nameIdRenderMock = jest.fn()
jest.mock('@common/components/NameIdDescriptionTags/NameIdDescriptionTags', () => ({
  __esModule: true,
  NameId: (props: NameIdDescriptionProps) => {
    // whenever createdMetrics is changed, call mock so test can validate passed props
    useEffect(() => {
      nameIdRenderMock()
    }, [props])
    return <></>
  }
}))

function WrapperComponent(metricsContentProps: DatadogMetricsDetailsContentProps): JSX.Element {
  return (
    <TestWrapper
      path={routes.toCVActivitySourceEditSetup({
        ...accountPathProps,
        ...projectPathProps
      })}
      pathParams={{
        accountId: projectPathProps.accountId,
        projectIdentifier: projectPathProps.projectIdentifier,
        orgIdentifier: projectPathProps.orgIdentifier,
        activitySource: '1234_activitySource',
        activitySourceId: '1234_sourceId'
      }}
    >
      <SetupSourceTabs data={MockDatadogMetricsHealthSource} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DatadogMetricsDetailsContent {...metricsContentProps} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('DatadogMetricsDetailsContent unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure that activeMetric, aggregation and serviceInstance are filled with provided values', async () => {
    const mockFormikProps: any = {
      initialValues: {
        ...MockDatadogMetricInfo
      },
      values: {
        ...MockDatadogMetricInfo
      },
      setFieldValue: jest.fn()
    }
    const mockSetMetricsData = jest.fn()
    const { container } = render(<WrapperComponent {...MockMetricsContentProps(mockSetMetricsData, mockFormikProps)} />)
    expect(container.querySelector('input[name="metric"]')).toHaveValue(MOCK_ACTIVE_METRIC)
    expect(container.querySelector('input[name="aggregator"]')).toHaveValue(
      'cv.monitoringSources.prometheus.avgAggregator'
    )
    expect(container.querySelector('input[name="serviceInstanceIdentifierTag"]')).toHaveValue('host')
  })
  test('Ensure that fields are enabled when manual query provided', async () => {
    const mockDatadogMetricInfo: DatadogMetricInfo = { ...MockDatadogMetricInfo, isCustomCreatedMetric: true }
    const mockFormikProps: any = {
      initialValues: {
        ...mockDatadogMetricInfo
      },
      values: {
        ...mockDatadogMetricInfo
      },
      setFieldValue: jest.fn()
    }
    const mockSetMetricsData = jest.fn()
    const { container } = render(
      <WrapperComponent {...MockMetricsContentProps(mockSetMetricsData, mockFormikProps, mockDatadogMetricInfo)} />
    )
    expect(container.querySelector('input[name="metricTags"]')).not.toHaveAttribute('disabled')
    expect(container.querySelector('input[name="metric"]')).not.toHaveAttribute('disabled')
    expect(container.querySelector('input[name="aggregator"]')).not.toHaveAttribute('disabled')
  })

  test('should validate that NameId is rendered', async () => {
    const mockDatadogMetricInfo: DatadogMetricInfo = { ...MockDatadogMetricInfo, isCustomCreatedMetric: true }
    const mockFormikProps: any = {
      initialValues: {
        ...mockDatadogMetricInfo
      },
      values: {
        ...mockDatadogMetricInfo
      },
      setFieldValue: jest.fn()
    }
    const mockSetMetricsData = jest.fn()
    render(
      <WrapperComponent {...MockMetricsContentProps(mockSetMetricsData, mockFormikProps, mockDatadogMetricInfo)} />
    )
    expect(nameIdRenderMock).toHaveBeenCalledTimes(1)
  })
})
