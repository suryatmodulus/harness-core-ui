/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type {
  DatadogAggregation,
  DatadogAggregationType,
  DatadogMetricInfo
} from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.type'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import { QUERY_CONTAINS_VALIDATION_PARAM } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.constants'

const datadogAggregations: DatadogAggregationType[] = ['avg', 'max', 'min', 'sum']
export const datadogAggregationOptions: DatadogAggregation[] = [
  {
    label: 'cv.monitoringSources.prometheus.avgAggregator',
    value: 'avg'
  },
  {
    label: 'cv.monitoringSources.prometheus.maxAggregator',
    value: 'max'
  },
  {
    label: 'cv.monitoringSources.prometheus.minAggregator',
    value: 'min'
  },
  {
    label: 'cv.monitoringSources.prometheus.sumAggregator',
    value: 'sum'
  }
]
export const DatadogMetricsQueryExtractor = (
  query: string,
  activeMetricValues: string[],
  aggregations: DatadogAggregationType[] = datadogAggregations
): {
  aggregation?: DatadogAggregationType
  activeMetric?: string
  metricTags: SelectOption[]
  groupingTags: string[]
} => {
  const aggregation = aggregations.find(aggregationItem => query.startsWith(aggregationItem))
  let activeMetric = activeMetricValues.find(metric => query.includes(metric))
  if (!activeMetric) {
    if (aggregation) {
      activeMetric = query.substring(query.indexOf(':') + 1, query.indexOf('{'))
    } else {
      if (query.indexOf('(') < query.indexOf('{')) {
        // this indicates that query contains function which starts with (
        activeMetric = query.substring(query.indexOf('(') + 1, query.indexOf('{'))
      } else {
        // there is no function and there is no aggregation, so metric starts from 0
        activeMetric = query.substring(0, query.indexOf('{'))
      }
    }
  }
  // extracting metricTags from query
  let metricTags: SelectOption[] = []
  const tagsString = query.substring(query.indexOf('{') + 1, query.indexOf('}'))
  if (tagsString !== '*') {
    metricTags = (tagsString.includes(',') ? tagsString.split(',') : [tagsString]).map(tag => {
      return {
        label: tag,
        value: tag
      }
    })
  }
  // extracting grouping tags from query
  let groupingTags: string[] = []
  const hostGroupingSearchString = 'by {'
  const hostGroupingIndex = query.indexOf(hostGroupingSearchString)
  if (hostGroupingIndex !== -1) {
    const groupingTagsString = query.substring(
      hostGroupingIndex + hostGroupingSearchString.length,
      query.indexOf('}', hostGroupingIndex + hostGroupingSearchString.length)
    )
    groupingTags = groupingTagsString.includes(',') ? groupingTagsString.split(',') : [groupingTagsString]
  }
  return {
    aggregation,
    activeMetric,
    metricTags,
    groupingTags
  }
}

export const DatadogMetricsQueryBuilder = (
  activeMetric: string,
  aggregation?: DatadogAggregationType,
  tags: string[] = [],
  groupingTags: string[] = [],
  serviceInstanceIdentifier?: string
): {
  query?: string
  groupingQuery?: string
} => {
  if (activeMetric?.length === 0) {
    return {
      query: ''
    }
  }
  let query: string
  if (aggregation && datadogAggregationOptions?.map(aggregationItem => aggregationItem.value).includes(aggregation)) {
    query = `${aggregation}:${activeMetric}`
  } else {
    query = activeMetric
  }
  if (tags.length > 0) {
    const tagsQueryPart = tags.reduce((prev, next) => {
      if (prev.length === 1) {
        return prev + next
      } else {
        return `${prev},${next}`
      }
    }, '{')
    query = `${query}${tagsQueryPart}}`
  } else {
    query = `${query}{*}`
  }

  if (groupingTags.length > 0) {
    const groupsQueryPart = groupingTags.reduce((prev, next) => {
      return `${prev},${next}`
    })
    query = `${query} by {${groupsQueryPart}}`
  }

  let groupedQuery = query
  // if there is serviceInstanceIdentifier selected and existing datadog query doesn't have grouping,
  // we should create groupedQuery to use it for CV
  if (serviceInstanceIdentifier && !groupingTags.length) {
    groupedQuery = `${query} by {${serviceInstanceIdentifier}}${QUERY_CONTAINS_VALIDATION_PARAM}`
  } else {
    groupedQuery = `${groupedQuery}${QUERY_CONTAINS_VALIDATION_PARAM}`
  }
  query = `${query}${QUERY_CONTAINS_VALIDATION_PARAM}`

  return {
    query,
    groupingQuery: groupedQuery
  }
}

export function mapMetricTagsHostIdentifierKeysOptions(metricTags: string[]): SelectOption[] {
  return Array.from(
    new Set(
      metricTags.concat('host').map(metricTag => {
        return metricTag.split(':')?.[0]
      })
    )
  )
    .filter(tagKey => !!tagKey)
    .map(tagKey => {
      return {
        label: tagKey,
        value: tagKey
      }
    })
}

export function mapMetricTagsToMetricTagsOptions(metricTags: string[]): SelectOption[] {
  return metricTags.map(metricTag => {
    return {
      value: metricTag,
      label: metricTag
    }
  })
}

export function getDatadogAggregationOptions(getString: (key: StringKeys) => string): SelectOption[] {
  return datadogAggregationOptions.map(aggregation => {
    return {
      label: getString(aggregation.label),
      value: aggregation.value
    }
  })
}

export function initializeDatadogGroupNames(
  mappedMetrics: Map<string, DatadogMetricInfo>,
  getString: UseStringsReturn['getString']
): SelectOption[] {
  const groupNames = Array.from(mappedMetrics, keyValue => {
    const { groupName } = keyValue?.[1] || {}
    return groupName
  }).filter(groupItem => groupItem !== null) as SelectOption[]

  return [{ label: getString('cv.addNew'), value: '' }, ...groupNames]
}
