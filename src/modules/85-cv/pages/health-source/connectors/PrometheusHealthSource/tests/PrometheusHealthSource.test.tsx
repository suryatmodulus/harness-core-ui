import React from 'react'
import { Container } from '@wings-software/uicore'
import type { UseGetReturn } from 'restful-react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { PrometheusHealthSource, PrometheusHealthSourceProps } from '../PrometheusHealthSource'
import { PrometheusMonitoringSourceFieldNames } from '../PrometheusHealthSource.constants'
import { MockManualQueryData } from './PrometheusHealthSource.mock'

jest.mock('../components/PrometheusQueryViewer/PrometheusQueryViewer', () => ({
  PrometheusQueryViewer: function MockComponent(props: any) {
    return (
      <Container>
        <button
          className="manualQuery"
          onClick={() => {
            props.onChange(PrometheusMonitoringSourceFieldNames.IS_MANUAL_QUERY, true)
          }}
        />
      </Container>
    )
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

jest.mock('../components/PrometheusGroupName/PrometheusGroupName', () => ({
  PrometheusGroupName: function MockComponent() {
    return <Container />
  }
}))

function WrapperComponent(props: PrometheusHealthSourceProps): JSX.Element {
  return (
    <TestWrapper>
      <SetupSourceTabs {...props} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <PrometheusHealthSource data={props.data} onSubmit={props.onSubmit} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Unit tests for PrometheusHealthSource', () => {
  beforeAll(() => {
    jest
      .spyOn(cvService, 'useGetLabelNames')
      .mockReturnValue({ data: { data: [] } } as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(cvService, 'useGetMetricNames')
      .mockReturnValue({ data: { data: [] } } as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(cvService, 'useGetMetricPacks')
      .mockReturnValue({ data: { data: [] } } as UseGetReturn<any, any, any, any>)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure that when user hits manual query, the manual query banner is visible', async () => {
    const onSubmitMock = jest.fn()
    const { container, getByText } = render(<WrapperComponent data={MockManualQueryData} onSubmit={onSubmitMock} />)

    await waitFor(() => expect(getByText('cv.monitoringSources.prometheus.customizeQuery')).not.toBeNull())
    expect(container.querySelectorAll('[class*="Accordion--panel"]').length).toBe(3)

    fireEvent.click(container.querySelector('button[class*="manualQuery"]')!)
    await waitFor(() => expect(getByText('cv.monitoringSources.prometheus.isManualQuery')).not.toBeNull())
    expect(container.querySelectorAll('[class*="Accordion--panel"]').length).toBe(2)

    fireEvent.click(getByText('submit'))
    await waitFor(() =>
      expect(onSubmitMock).toHaveBeenCalledWith(MockManualQueryData, {
        identifier: 'prometheus',
        name: 'prometheus',
        spec: {
          connectorRef: 'prometheusConnector',
          feature: 'apm',
          metricDefinitions: [
            {
              additionalFilters: [],
              aggregation: undefined,
              envFilter: [],
              groupName: 'group1',
              isManualQuery: true,
              metricName: 'NoLongerManualQuery',
              prometheusMetric: undefined,
              query: 'count(container_cpu_load_average_10s{container="cv-demo",namespace="cv-demo"})',
              riskProfile: {
                category: 'Infrastructure',
                metricType: 'INFRA',
                thresholdTypes: ['ACT_WHEN_LOWER', 'ACT_WHEN_HIGHER']
              },
              serviceFilter: [],
              serviceInstanceFieldName: 'alertname'
            }
          ]
        },
        type: 'Prometheus'
      })
    )
  })
})
