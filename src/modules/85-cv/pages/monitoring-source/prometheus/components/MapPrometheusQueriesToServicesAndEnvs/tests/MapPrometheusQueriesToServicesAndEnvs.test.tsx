import React from 'react'
import { Container } from '@wings-software/uicore'
import type { UseGetReturn } from 'restful-react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  SetupSourceTabs,
  SetupSourceTabsProps
} from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import * as cvService from 'services/cv'
import * as cdService from 'services/cd-ng'
import { MapPrometheusQueryToServiceFieldNames } from '../constants'
import { MapPrometheusQueriesToServicesAndEnvs } from '../MapPrometheusQueriesToServicesAndEnvs'
import { updateSelectedMetricsMap, validateMappings } from '../utils'

jest.mock('../components/QueryViewer/QueryViewer', () => ({
  QueryViewer: function MockComponent() {
    return <Container />
  }
}))

jest.mock('../components/MapPrometheusMetricToService/MapPrometheusMetricToService', () => ({
  MapPrometheusMetricToService: function MockComponent() {
    return <Container />
  }
}))

jest.mock('../components/PrometheusQueryBuilder/PrometheusQueryBuilder', () => ({
  PrometheusQueryBuilder: function MockComponent() {
    return <Container />
  }
}))

jest.mock('../components/PrometheusRiskProfile/PrometheusRiskProfile', () => ({
  PrometheusRiskProfile: function MockComponent() {
    return <Container />
  }
}))

jest.mock('../components/PrometheusMetricsSideNav/PrometheusMetricsSideNav', () => ({
  PrometheusMetricsSideNav: function MockComponent() {
    return <Container />
  }
}))

function mockGetString(name: string) {
  switch (name) {
    case 'cv.monitoringSources.envValidation':
      return MapPrometheusQueryToServiceFieldNames.ENVIRONMENT
    case 'cv.monitoringSources.prometheus.validation.filterOnEnvironment':
      return MapPrometheusQueryToServiceFieldNames.ENVIRONMENT_FILTER
    case 'cv.monitoringSources.metricNameValidation':
      return MapPrometheusQueryToServiceFieldNames.METRIC_NAME
    case 'cv.monitoringSources.prometheus.validation.promethusMetric':
      return MapPrometheusQueryToServiceFieldNames.PROMETHEUS_METRIC
    case 'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory':
      return MapPrometheusQueryToServiceFieldNames.RISK_CATEGORY
    case 'cv.monitoringSources.prometheus.validation.filterOnService':
      return MapPrometheusQueryToServiceFieldNames.SERVICE_FILTER
    case 'cv.monitoringSources.prometheus.validation.serviceInstanceIdentifier':
      return MapPrometheusQueryToServiceFieldNames.SERVICE_INSTANCE
    case 'cv.monitoringSources.gco.manualInputQueryModal.validation.query':
      return MapPrometheusQueryToServiceFieldNames.QUERY
    case 'cv.monitoringSources.prometheus.validation.deviation':
      return MapPrometheusQueryToServiceFieldNames.LOWER_BASELINE_DEVIATION
    case 'cv.monitoringSources.prometheus.validation.metricNameUnique':
      return 'metricUnique'
    case 'cv.monitoringSources.prometheus.validation.recordCount':
      return MapPrometheusQueryToServiceFieldNames.RECORD_COUNT
    case 'cv.monitoringSources.serviceValidation':
      return MapPrometheusQueryToServiceFieldNames.SERVICE
  }
}

function WrapperComponent<PrometheusSetupSource>(
  props: Pick<SetupSourceTabsProps<PrometheusSetupSource>, 'data'>
): JSX.Element {
  return (
    <TestWrapper>
      <SetupSourceTabs {...props} tabTitles={['Review']} determineMaxTab={() => 0}>
        <MapPrometheusQueriesToServicesAndEnvs />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Unit tests for MapPrometheusQueriesToServicesAndEnvs', () => {
  test('Ensure validation returns correctly', () => {
    // no values
    expect(validateMappings(mockGetString as any, [], 0)).toEqual({
      envFilter: MapPrometheusQueryToServiceFieldNames.ENVIRONMENT_FILTER,
      envIdentifier: MapPrometheusQueryToServiceFieldNames.ENVIRONMENT,
      metricName: MapPrometheusQueryToServiceFieldNames.METRIC_NAME,
      prometheusMetric: MapPrometheusQueryToServiceFieldNames.PROMETHEUS_METRIC,
      query: MapPrometheusQueryToServiceFieldNames.QUERY,
      riskCategory: MapPrometheusQueryToServiceFieldNames.RISK_CATEGORY,
      serviceFilter: MapPrometheusQueryToServiceFieldNames.SERVICE_FILTER,
      serviceIdentifier: MapPrometheusQueryToServiceFieldNames.SERVICE,
      serviceInstance: MapPrometheusQueryToServiceFieldNames.SERVICE_INSTANCE
    })

    // some values
    expect(
      validateMappings(mockGetString as any, [], 0, {
        envFilter: [{ label: 'as', value: 'asd' }],
        query: '',
        isManualQuery: false,
        serviceFilter: [{ label: 'ada', value: 'asd' }],
        metricName: 'adasd'
      })
    ).toEqual({
      envIdentifier: MapPrometheusQueryToServiceFieldNames.ENVIRONMENT,
      prometheusMetric: MapPrometheusQueryToServiceFieldNames.PROMETHEUS_METRIC,
      query: MapPrometheusQueryToServiceFieldNames.QUERY,
      lowerBaselineDeviation: MapPrometheusQueryToServiceFieldNames.LOWER_BASELINE_DEVIATION,
      riskCategory: MapPrometheusQueryToServiceFieldNames.RISK_CATEGORY,
      serviceIdentifier: MapPrometheusQueryToServiceFieldNames.SERVICE,
      serviceInstance: MapPrometheusQueryToServiceFieldNames.SERVICE_INSTANCE
    })

    // record count and nonunique metricName
    expect(
      validateMappings(mockGetString as any, ['metric1', 'metric4'], 0, {
        envFilter: [{ label: 'as', value: 'asd' }],
        query: 'sdfsdf',
        recordCount: 5,
        isManualQuery: false,
        serviceFilter: [{ label: 'ada', value: 'asd' }],
        metricName: 'metric4'
      })
    ).toEqual({
      envIdentifier: MapPrometheusQueryToServiceFieldNames.ENVIRONMENT,
      prometheusMetric: MapPrometheusQueryToServiceFieldNames.PROMETHEUS_METRIC,
      query: MapPrometheusQueryToServiceFieldNames.RECORD_COUNT,
      lowerBaselineDeviation: MapPrometheusQueryToServiceFieldNames.LOWER_BASELINE_DEVIATION,
      riskCategory: MapPrometheusQueryToServiceFieldNames.RISK_CATEGORY,
      serviceIdentifier: MapPrometheusQueryToServiceFieldNames.SERVICE,
      serviceInstance: MapPrometheusQueryToServiceFieldNames.SERVICE_INSTANCE,
      metricName: 'metricUnique'
    })
  })

  test('Ensure switching to a new app is handled correctly', () => {
    // user updates currently selected metric name and adds new metric4
    expect(
      updateSelectedMetricsMap({
        updatedMetric: 'metric4',
        oldMetric: 'metric1',
        mappedMetrics: new Map([
          [
            'metric1',
            {
              metricName: 'metric1',
              serviceIdentifier: { label: 'cvng', value: 'CVNG' },
              envIdentifier: { label: 'qa', value: 'QA' },
              prometheusMetric: 'count_seconds_cpu',
              query: '(solo-dolo) dsfs',
              isManualQuery: false,
              serviceFilter: [{ label: 'serviceLabel:serviceValue', value: 'service' }],
              envFilter: [{ label: 'envLabel:envValue', value: 'env' }],
              additionalFilter: [],
              riskCategory: 'Performance/ResponseTime',
              serviceInstance: 'some_service_instance_value',
              lowerBaselineDeviation: true,
              higherBaselineDeviation: true,
              groupName: { label: 'group1', value: 'group1' }
            }
          ]
        ]),
        formikProps: { values: { metricName: 'metric', query: '', isManualQuery: false } } as any
      })
    ).toEqual({
      mappedMetrics: new Map([
        [
          'metric4',
          {
            isManualQuery: false,
            metricName: 'metric4',
            query: ''
          }
        ],
        [
          'metric',
          {
            isManualQuery: false,
            metricName: 'metric',
            query: ''
          }
        ]
      ]),
      selectedMetric: 'metric4'
    })

    //user updates selected metric to an already existing one
    expect(
      updateSelectedMetricsMap({
        updatedMetric: 'metric4',
        oldMetric: 'metric1',
        mappedMetrics: new Map([
          [
            'metric1',
            {
              metricName: 'metric',
              serviceIdentifier: { label: 'cvng', value: 'CVNG' },
              envIdentifier: { label: 'qa', value: 'QA' },
              prometheusMetric: 'count_seconds_cpu',
              query: '(solo-dolo) dsfs',
              isManualQuery: false,
              serviceFilter: [{ label: 'serviceLabel:serviceValue', value: 'service' }],
              envFilter: [{ label: 'envLabel:envValue', value: 'env' }],
              additionalFilter: [],
              riskCategory: 'Performance/ResponseTime',
              serviceInstance: 'some_service_instance_value',
              lowerBaselineDeviation: true,
              higherBaselineDeviation: true,
              groupName: { label: 'group1', value: 'group1' }
            }
          ]
        ]),
        formikProps: { values: { metricName: 'metric', query: '', isManualQuery: false } } as any
      })
    ).toEqual({
      mappedMetrics: new Map([
        [
          'metric4',
          {
            isManualQuery: false,
            metricName: 'metric4',
            query: ''
          }
        ],
        [
          'metric',
          {
            isManualQuery: false,
            metricName: 'metric',
            query: ''
          }
        ]
      ]),
      selectedMetric: 'metric4'
    })

    // user updates data for current selected one and adds a new one
    expect(
      updateSelectedMetricsMap({
        updatedMetric: 'metric6',
        oldMetric: 'metric',
        mappedMetrics: new Map([
          [
            'metric',
            {
              metricName: 'metric',
              query: 'sd',
              isManualQuery: false
            }
          ]
        ]),
        formikProps: {
          values: {
            metricName: 'metric',
            query: 'dsklfjsdflksjfkl',
            isManualQuery: false,
            serviceIdentifier: { label: 'cvng', value: 'CVNG' },
            envIdentifier: { label: 'qa', value: 'QA' },
            prometheusMetric: 'count_seconds_cpu',
            serviceFilter: [{ label: 'serviceLabel:serviceValue', value: 'service' }],
            envFilter: [{ label: 'envLabel:envValue', value: 'env' }],
            additionalFilter: [],
            riskCategory: 'Performance/ResponseTime',
            serviceInstance: 'some_service_instance_value',
            lowerBaselineDeviation: true,
            higherBaselineDeviation: true,
            groupName: { label: 'group1', value: 'group1' }
          }
        } as any
      })
    ).toEqual({
      mappedMetrics: new Map([
        [
          'metric',
          {
            metricName: 'metric',
            query: 'dsklfjsdflksjfkl',
            isManualQuery: false,
            serviceIdentifier: { label: 'cvng', value: 'CVNG' },
            envIdentifier: { label: 'qa', value: 'QA' },
            prometheusMetric: 'count_seconds_cpu',
            serviceFilter: [{ label: 'serviceLabel:serviceValue', value: 'service' }],
            envFilter: [{ label: 'envLabel:envValue', value: 'env' }],
            additionalFilter: [],
            riskCategory: 'Performance/ResponseTime',
            serviceInstance: 'some_service_instance_value',
            lowerBaselineDeviation: true,
            higherBaselineDeviation: true,
            groupName: { label: 'group1', value: 'group1' }
          }
        ],
        [
          'metric6',
          {
            isManualQuery: false,
            metricName: 'metric6',
            query: ''
          }
        ]
      ]),
      selectedMetric: 'metric6'
    })
  })

  test('Ensure that when user hits manual query, the manual query banner is visible', async () => {
    jest
      .spyOn(cvService, 'useGetLabelNames')
      .mockReturnValue({ data: { data: [] } } as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(cvService, 'useGetMetricNames')
      .mockReturnValue({ data: { data: [] } } as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(cvService, 'useGetMetricPacks')
      .mockReturnValue({ data: { data: [] } } as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(cdService, 'useGetServiceListForProject')
      .mockReturnValue({ data: { data: [] } } as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(cdService, 'useGetEnvironmentListForProject')
      .mockReturnValue({ data: { data: [] } } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <WrapperComponent
        data={{
          connectorRef: {
            label: 'sdfsdf',
            value: 'sdfsf'
          },
          mappedServicesAndEnvs: new Map([
            [
              'metric',
              {
                metricName: 'metric',
                query: 'dsklfjsdflksjfkl',
                isManualQuery: true,
                serviceIdentifier: { label: 'cvng', value: 'CVNG' },
                envIdentifier: { label: 'qa', value: 'QA' },
                riskCategory: 'Performance/ResponseTime',
                serviceInstance: 'some_service_instance_value',
                lowerBaselineDeviation: true,
                higherBaselineDeviation: true,
                groupName: { label: 'group1', value: 'group1' }
              }
            ]
          ])
        }}
      />
    )

    await waitFor(() => expect(getByText('cv.monitoringSources.prometheus.customizeQuery')).not.toBeNull())
    expect(container.querySelectorAll('[class*="Accordion--panel"]').length).toBe(2)

    fireEvent.click(getByText('cv.monitoringSources.prometheus.undoManualQuery'))
    await waitFor(() => expect(container.querySelector('[class*="manualQueryWarning"]')).toBeNull())

    expect(container.querySelectorAll('[class*="Accordion--panel"]').length).toBe(3)
  })
})
