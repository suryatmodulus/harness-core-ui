import React, { useState } from 'react'
import { cloneDeep } from 'lodash-es'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { Container } from '@wings-software/uicore'
import { fillAtForm, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import * as cvService from 'services/cv'
import * as cdService from 'services/cd-ng'
import { ManualInputQueryModal, MANUAL_INPUT_QUERY } from '../components/ManualInputQueryModal/ManualInputQueryModal'
import { GCOMetricsHealthSource } from '../GCOMetricsHealthSource'
import type { GCOMetricsHealthSourceProps } from '../GCOMetricsHealthSource.type'
import { FieldNames } from '../GCOMetricsHealthSource.constants'
import { GCOProduct } from '../../GCOLogsMonitoringSource/GoogleCloudOperationsMonitoringSourceUtils'

const MockQuery = `{}`
const MockQueryWithGroupBy = '{"sdfsdf": "groupByFields sdfs"}'
const MockSelectedMetricInfo = {
  query: '{"someQuery": "sdosdf"}',
  widgetName: 'widget_1',
  metric: 'metric_1'
}

const currentProduct = GCOProduct.CLOUD_METRICS
const MockParams = {
  accountId: '1234_accountId',
  projectIdentifier: '1234_projectid',
  orgIdentifier: '1234_orgId'
}

const MetricPackResponse = {
  metaData: {},
  resource: [
    {
      uuid: '9Xg2tjyAQCqcekCTVc_xtw',
      accountId: 'eWZFoTkESDSkPfnGwAp0lQ',
      orgIdentifier: 'cv_stable',
      projectIdentifier: 'cv_validation',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Errors',
      category: 'Errors',
      metrics: [{ name: 'Errors', type: 'ERROR', path: null, validationPath: null, thresholds: [], included: false }],
      thresholds: null
    },
    {
      uuid: '5CBVKks3T4WLIpYtaNO58g',
      accountId: 'eWZFoTkESDSkPfnGwAp0lQ',
      orgIdentifier: 'cv_stable',
      projectIdentifier: 'cv_validation',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Infrastructure',
      category: 'Infrastructure',
      metrics: [
        { name: 'Infrastructure', type: 'INFRA', path: null, validationPath: null, thresholds: [], included: false }
      ],
      thresholds: null
    },
    {
      uuid: 'NmTC-1wRSfmviaeu3n87Gw',
      accountId: 'eWZFoTkESDSkPfnGwAp0lQ',
      orgIdentifier: 'cv_stable',
      projectIdentifier: 'cv_validation',
      dataSourceType: 'STACKDRIVER',
      identifier: 'Performance',
      category: 'Performance',
      metrics: [
        { name: 'Response Time', type: 'RESP_TIME', path: null, validationPath: null, thresholds: [], included: false },
        { name: 'Other', type: 'ERROR', path: null, validationPath: null, thresholds: [], included: false },
        { name: 'Throughput', type: 'THROUGHPUT', path: null, validationPath: null, thresholds: [], included: false }
      ],
      thresholds: null
    }
  ],
  responseMessages: []
}

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as any),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

jest.mock('../components/GCODashboardWidgetMetricNav/GCODashboardWidgetMetricNav', () => ({
  ...(jest.requireActual('../components/GCODashboardWidgetMetricNav/GCODashboardWidgetMetricNav') as any),
  GCODashboardWidgetMetricNav: function MockMetricNav(props: any) {
    const [openModal, setOpenModal] = useState(false)
    return (
      <>
        {openModal && (
          <ManualInputQueryModal
            onSubmit={() => {
              props.onSelectMetric(MockSelectedMetricInfo.metric, MANUAL_INPUT_QUERY, MockSelectedMetricInfo.widgetName)
            }}
            closeModal={() => setOpenModal(false)}
          />
        )}
        <Container
          className="manualQuery"
          onClick={() => {
            props.onSelectMetric(MockSelectedMetricInfo.metric, MANUAL_INPUT_QUERY, MockSelectedMetricInfo.widgetName)
            setOpenModal(true)
          }}
        />
        <Container
          className="metricWidgetNav"
          onClick={() =>
            props.onSelectMetric(
              MockSelectedMetricInfo.metric,
              MockSelectedMetricInfo.query,
              MockSelectedMetricInfo.widgetName
            )
          }
        />
      </>
    )
  }
}))

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

jest.mock('react-monaco-editor', () => (props: any) => (
  <Container className="monaco-editor">
    <button className="monaco-editor-onChangebutton" onClick={() => props.onChange('{ "sdfsdffdf": "2132423" }')} />
  </Container>
))

const MockValidationResponse = {
  metaData: {},
  data: [
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.151677124512961,
      timestamp: 1607599860000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.149014549984008,
      timestamp: 1607599920000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 7.050477594430973,
      timestamp: 1607599980000
    }
  ]
}

const MockValidationResponseWithMultipleTxns = {
  metaData: {},
  data: [
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.151677124512961,
      timestamp: 1607599860000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 12.149014549984008,
      timestamp: 1607599920000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_usage_time',
      metricName: 'kubernetes.io/container/cpu/core_usage_time',
      metricValue: 7.050477594430973,
      timestamp: 1607599980000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_time',
      metricName: 'kubernetes.io/container/cpu/core_time',
      metricValue: 12.65,
      timestamp: 1607599920000
    },
    {
      txnName: 'kubernetes.io/container/cpu/core_time',
      metricName: 'kubernetes.io/container/cpu/core_time/s',
      metricValue: 12.65,
      timestamp: 1607599980000
    }
  ]
}

function WrapperComponent({ data, onSubmit }: GCOMetricsHealthSourceProps) {
  return (
    <TestWrapper>
      <SetupSourceTabs data={data} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <GCOMetricsHealthSource data={data} onSubmit={onSubmit} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

const DefaultObject = {
  ...MockParams,
  identifier: 'MyGoogleCloudOperationsSource',
  product: currentProduct,
  name: 'MyGoogleCloudOperationsSource',
  selectedDashboards: [],
  selectedMetrics: new Map(),
  type: 'STACKDRIVER',
  mappedServicesAndEnvs: new Map(),
  isEdit: false
}

describe('Unit tests for MapGCOMetricsToServices', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  beforeEach(() => {
    jest.clearAllMocks()
    const getEnvironmentSpy = jest.spyOn(cdService, 'useGetEnvironmentListForProject')
    getEnvironmentSpy.mockReturnValue({
      data: {
        data: {
          content: [
            {
              accountId: 'kmpySmUISimoRrJL6NL73w',
              deleted: false,
              description: null,
              identifier: 'Qe',
              name: 'Qe',
              orgIdentifixer: 'harness_test',
              projectIdentifier: 'raghu_p',
              tags: {},
              type: 'PreProduction'
            }
          ]
        }
      }
    } as UseGetReturn<any, any, any, any>)

    const getServiceSpy = jest.spyOn(cdService, 'useGetServiceListForProject')
    getServiceSpy.mockReturnValue({
      data: {
        data: {
          content: [
            {
              accountId: 'kmpySmUISimoRrJL6NL73w',
              deleted: false,
              description: null,
              identifier: 'verification',
              name: 'verification',
              orgIdentifier: 'harness_test',
              projectIdentifier: 'raghu_p',
              tags: {},
              version: 0
            }
          ]
        }
      }
    } as UseGetReturn<any, any, any, any>)
  })
  test('Ensure validation api is called on query input', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as UseGetReturn<any, any, any, any>)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMock = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponse
      })
    )

    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    const { container } = render(<WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />)

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await setFieldValue({ container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery })

    jest.advanceTimersByTime(2000)
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[class*="highcharts"]')).not.toBeNull()

    const viewQuery = container.querySelector('[data-name="viewQuery"]')
    if (!viewQuery) {
      throw new Error('View query button not rendered.')
    }

    fireEvent.click(viewQuery)
    await waitFor(() => expect(document.body.querySelector('[class*="monaco-editor"]')).not.toBeNull())
    const changeButton = document.body.querySelector('button.monaco-editor-onChangebutton')
    if (!changeButton) {
      throw Error('button did not render.')
    }

    fireEvent.click(changeButton)
    await waitFor(() => expect(container.querySelector('textarea')?.innerHTML).toEqual('{ "sdfsdffdf": "2132423" }'))
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1))
  })

  test('Ensure that when a metric is selected in the nav, the content in the form is rendered', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as UseGetReturn<any, unknown, any, unknown>)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMock = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponse
      })
    )

    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    const onSubmitMock = jest.fn()
    const { container, getByText } = render(
      <WrapperComponent onSubmit={onSubmitMock} data={cloneDeep(DefaultObject)} />
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const metricNav = container.querySelector('.metricWidgetNav')
    if (!metricNav) {
      throw Error('Metric nav was not rendered.')
    }

    fireEvent.click(metricNav)
    await waitFor(() =>
      expect(container.querySelector(`input[value="${MockSelectedMetricInfo.metric}"]`)).not.toBeNull()
    )
    expect(getByText(MockSelectedMetricInfo.widgetName)).not.toBeNull()

    fireEvent.click(getByText('submit'))
    expect(onSubmitMock).not.toHaveBeenCalled()
  })

  test('Ensure that when validation api throws error or returns no data, correct content is displayed', async () => {
    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMock = jest.fn().mockRejectedValue({ data: { detailedMessage: 'mock error' } })
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as UseGetReturn<any, unknown, any, unknown>)

    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)
    const { container, getByText, rerender } = render(
      <WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />
    )

    // error case
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await setFieldValue({ container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery })

    await waitFor(() => expect(getByText('mock error')).not.toBeNull())
    expect(container.querySelector('[class*="highcharts"]')).toBeNull()

    // no data case
    mutateMock.mockReturnValue(
      Promise.resolve({
        data: { data: [] }
      })
    )
    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)

    rerender(<WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />)

    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: FieldNames.QUERY,
      value: '{ "dsadd": "dsfs" }'
    })
    await waitFor(() => expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.noDataForQuery')))

    //retry api
    fireEvent.click(getByText('retry'))
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(3))
  })

  test('ensure metric name is updated and saved when user updates it for manual query', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: MetricPackResponse
    } as UseGetReturn<any, unknown, any, unknown>)
    const onSubmitMock = jest.fn()

    const { container } = render(<WrapperComponent onSubmit={onSubmitMock} data={cloneDeep(DefaultObject)} />)

    // select metric option and fill out metric name in displayed modal
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const manualQueryOption = container.querySelector('.manualQuery')
    if (!manualQueryOption) {
      throw Error('manual query was not rendered.')
    }
    fireEvent.click(manualQueryOption)

    await waitFor(() =>
      expect(document.body.querySelector('[class*="ManualInputModal"] input[name="metricName"]')).not.toBeNull()
    )
    const metricNameInput = document.body.querySelector('[class*="ManualInputModal"] input[name="metricName"]')
    if (!metricNameInput) {
      throw Error('Metric name was not found.')
    }

    fireEvent.change(metricNameInput, { target: { value: 'solo-dolo' } })
    const buttons = document.body.querySelectorAll('[class*="buttonContainer"] button')
    if (!buttons) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(buttons[1])
    await waitFor(() =>
      expect(document.body.querySelector('[class*="ManualInputModal"] input[name="metricName"]')).toBeNull()
    )
    await waitFor(() => expect(container.querySelector('input[value="metric_1"]')).not.toBeNull())

    // fill out parts of the form
    await fillAtForm([
      { container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery },
      { container, type: InputTypes.RADIOS, fieldId: FieldNames.RISK_CATEGORY, value: 'Errors/ERROR' },
      { container, type: InputTypes.CHECKBOX, fieldId: FieldNames.HIGHER_BASELINE_DEVIATION, value: 'higher' }
    ])

    // enter service and environment values and tags
    const metricTagsInput = container.querySelector(
      '[class*="nameAndMetricTagContainer"] [data-id*="metricTags"] input'
    )
    if (!metricTagsInput) {
      throw Error('metric tags was not rendered.')
    }

    fireEvent.change(metricTagsInput, { target: { value: 'metricTag' } })
    await waitFor(() => expect(container.querySelector('input[value="metricTag"]')).not.toBeNull())

    const submitFormButton = container.querySelector('button[class*="nextButton"]')
    if (!submitFormButton) {
      throw Error('submit form button does not exist.')
    }

    fireEvent.click(submitFormButton)
  })

  test('Ensure that when too many metrics are returned for a groupBy query, validation is displayed', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as UseGetReturn<any, any, any, any>)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMock = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponseWithMultipleTxns
      })
    )

    sampleDataSpy.mockReturnValue({ mutate: mutateMock as unknown, cancel: jest.fn() as unknown } as UseMutateReturn<
      any,
      any,
      any,
      any,
      any
    >)

    const { container, getByText } = render(<WrapperComponent onSubmit={jest.fn()} data={cloneDeep(DefaultObject)} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: FieldNames.QUERY,
      value: MockQueryWithGroupBy
    })

    // assign a query with gruopByFields and ensure validation is there
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[class*="highcharts"]')).not.toBeNull()
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.tooManyMetrics')).not.toBeNull()
    )

    // remove the groupByFields value and ensure validation message disappeared
    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: FieldNames.QUERY,
      value: MockQuery
    })
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(2))
    expect(container.querySelector('[class*="highcharts"]')).not.toBeNull()
    await waitFor(() => expect(container.querySelector('[class*="tooManyRecords"]')).toBeNull())
  })
})
