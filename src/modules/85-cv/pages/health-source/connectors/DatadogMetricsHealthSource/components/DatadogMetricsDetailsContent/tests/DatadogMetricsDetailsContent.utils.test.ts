/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  DatadogMetricsQueryBuilder,
  DatadogMetricsQueryExtractor,
  mapMetricTagsHostIdentifierKeysOptions
} from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/components/DatadogMetricsDetailsContent/DatadogMetricsDetailsContent.utils'
import {
  MOCK_QUERY_OUTPUT,
  MOCK_ACTIVE_METRIC,
  MOCK_AGGREGATION,
  MOCK_ACTIVE_METRICS,
  MOCK_METRIC_TAGS_WITH_DUPLICATES,
  EXPECTED_METRIC_SELECT_OPTIONS,
  MOCK_SERVICE_INSTANCE,
  MOCK_GROUPING_QUERY_OUTPUT
} from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/components/DatadogMetricsDetailsContent/tests/mock'

describe('Validate Utils', () => {
  test('should create query with provided activeMetric, aggregation and serviceInstance', () => {
    expect(DatadogMetricsQueryBuilder(MOCK_ACTIVE_METRIC, MOCK_AGGREGATION, [], MOCK_SERVICE_INSTANCE).query).toEqual(
      MOCK_QUERY_OUTPUT
    )
    expect(
      DatadogMetricsQueryBuilder(MOCK_ACTIVE_METRIC, MOCK_AGGREGATION, [], MOCK_SERVICE_INSTANCE).groupingQuery
    ).toEqual(MOCK_GROUPING_QUERY_OUTPUT)
  })
  test('should extract activeMetrics and aggregation from provided query', () => {
    expect(DatadogMetricsQueryExtractor(MOCK_QUERY_OUTPUT, MOCK_ACTIVE_METRICS)).toEqual({
      aggregation: MOCK_AGGREGATION,
      activeMetric: MOCK_ACTIVE_METRIC
    })
  })
  test('should map tags to SelectOptions, remove duplicates if exists and add host', () => {
    expect(mapMetricTagsHostIdentifierKeysOptions(MOCK_METRIC_TAGS_WITH_DUPLICATES)).toEqual(
      EXPECTED_METRIC_SELECT_OPTIONS
    )
  })
})
