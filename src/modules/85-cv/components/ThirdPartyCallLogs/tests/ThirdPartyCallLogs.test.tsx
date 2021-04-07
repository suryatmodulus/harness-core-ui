import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { ThirdPartyCallLogModal } from '../ThirdPartyCallLogs'

const MockResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 1000,
    content: [
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        traceableId: '2r98hkbn69t',
        createdAt: 1617385449784,
        startTime: 1617385382.48,
        endTime: 1617385442.48,
        traceableType: 'ONBOARDING',
        requests: [
          {
            name: 'url',
            value:
              'https://harness-test.saas.appdynamics.com/controller/rest/applications/Harness-Dev/metric-data?output=JSON&time-range-type=BEFORE_NOW&duration-in-mins=60&rollup=true&metric-path=Overall%20Application%20Performance|verification_service|Exceptions%20per%20Minute',
            type: 'URL'
          }
        ],
        responses: [
          { name: 'Status Code', value: '200', type: 'NUMBER' },
          {
            name: 'Response Body',
            value:
              '[{"metricId":7.7711007E7,"metricName":"METRIC DATA NOT FOUND","metricPath":"Overall Application Performance|verification_service|Exceptions per Minute","frequency":"SIXTY_MIN","metricValues":[]}]',
            type: 'JSON'
          }
        ],
        requestTime: 1617385442.682,
        responseTime: 1617385445.641,
        type: 'API_CALL_LOG'
      },
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        traceableId: '2r98hkbn69t',
        createdAt: 1617385450909,
        startTime: 1617385386.597,
        endTime: 1617385446.597,
        traceableType: 'ONBOARDING',
        requests: [
          {
            name: 'url',
            value:
              'https://harness-test.saas.appdynamics.com/controller/rest/applications/Harness-Dev/metric-data?output=JSON&time-range-type=BEFORE_NOW&duration-in-mins=60&rollup=true&metric-path=Overall%20Application%20Performance|verification_service|Errors%20per%20Minute',
            type: 'URL'
          }
        ],
        responses: [
          { name: 'Status Code', value: '200', type: 'NUMBER' },
          {
            name: 'Response Body',
            value:
              '[{"metricId":7.7711006E7,"metricName":"METRIC DATA NOT FOUND","metricPath":"Overall Application Performance|verification_service|Errors per Minute","frequency":"SIXTY_MIN","metricValues":[]}]',
            type: 'JSON'
          }
        ],
        requestTime: 1617385446.759,
        responseTime: 1617385449.809,
        type: 'API_CALL_LOG'
      },
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        traceableId: '2r98hkbn69t',
        createdAt: 1617385450907,
        startTime: 1617385386.597,
        endTime: 1617385446.597,
        traceableType: 'ONBOARDING',
        requests: [
          {
            name: 'url',
            value:
              'https://harness-test.saas.appdynamics.com/controller/rest/applications/Harness-Dev/metric-data?output=JSON&time-range-type=BEFORE_NOW&duration-in-mins=60&rollup=true&metric-path=Overall%20Application%20Performance|verification_service|Calls%20per%20Minute',
            type: 'URL'
          }
        ],
        responses: [
          { name: 'Status Code', value: '400', type: 'NUMBER' },
          {
            name: 'Response Body',
            value:
              '[{"metricId":7.7711003E7,"metricName":"METRIC DATA NOT FOUND","metricPath":"Overall Application Performance|verification_service|Calls per Minute","frequency":"SIXTY_MIN","metricValues":[]}]',
            type: 'JSON'
          }
        ],
        requestTime: 1617385446.759,
        responseTime: 1617385449.78,
        type: 'API_CALL_LOG'
      },
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        traceableId: '2r98hkbn69t',
        createdAt: 1617385450904,
        startTime: 1617385386.597,
        endTime: 1617385446.597,
        traceableType: 'ONBOARDING',
        requests: [
          {
            name: 'url',
            value:
              'https://harness-test.saas.appdynamics.com/controller/rest/applications/Harness-Dev/metric-data?output=JSON&time-range-type=BEFORE_NOW&duration-in-mins=60&rollup=true&metric-path=Overall%20Application%20Performance|verification_service|Average%20Response%20Time%20(ms)',
            type: 'URL'
          }
        ],
        responses: [
          { name: 'Status Code', value: '300', type: 'NUMBER' },
          {
            name: 'Response Body',
            value:
              '[{"metricId":7.7711002E7,"metricName":"METRIC DATA NOT FOUND","metricPath":"Overall Application Performance|verification_service|Average Response Time (ms)","frequency":"SIXTY_MIN","metricValues":[]}]',
            type: 'JSON'
          }
        ],
        requestTime: 1617385446.759,
        responseTime: 1617385449.778,
        type: 'API_CALL_LOG'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '57fb0cf3-0998-4b7b-b4fa-3b82ce89bcd1'
}

describe('Unit tests for Third Party call logs', () => {
  test('Ensure when loading spinner is displayed', async () => {
    jest.spyOn(cvService, 'useGetOnboardingLogs').mockReturnValue({ loading: true } as UseGetReturn<any, any, any, any>)
    const onHideFn = jest.fn()
    render(
      <TestWrapper>
        <ThirdPartyCallLogModal
          guid="12123"
          onHide={onHideFn}
          verificationType="AppDynamics"
          onBackButtonClick={onHideFn}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelector('[class*="spinner"]')).not.toBeNull())
  })

  test('Ensure when api error exists,  error is displayed', async () => {
    jest
      .spyOn(cvService, 'useGetOnboardingLogs')
      .mockReturnValue({ error: { data: { message: 'mockerror' } } } as UseGetReturn<any, any, any, any>)
    const onHideFn = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <ThirdPartyCallLogModal
          guid="12123"
          onHide={onHideFn}
          verificationType="AppDynamics"
          onBackButtonClick={onHideFn}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('mockerror')).not.toBeNull())
  })

  test('Ensure modal renders correctly given api mock data', async () => {
    jest
      .spyOn(cvService, 'useGetOnboardingLogs')
      .mockReturnValue({ data: MockResponse } as UseGetReturn<any, any, any, any>)
    const onHideFn = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <ThirdPartyCallLogModal
          guid="12123"
          onHide={onHideFn}
          verificationType="AppDynamics"
          onBackButtonClick={onHideFn}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelectorAll('[class*="requestCard"]').length).toBe(4))

    // ensure first noe is selected and content is displayed
    expect(document.body.querySelector('[class*="requestCard"][data-selected="true"]')).not.toBeNull()
    expect(
      document.body.querySelector('[data-selected="true"] span[data-icon="deployment-success-legacy"]')
    ).not.toBeNull()
    expect(document.body.querySelector('[class*="requestContainer"] p')?.innerHTML).toEqual(
      'https://harness-test.saas.appdynamics.com/controller/rest/applications/Harness-Dev/metric-data?output=JSON&amp;time-range-type=BEFORE_NOW&amp;duration-in-mins=60&amp;rollup=true&amp;metric-path=Overall%20Application%20Performance|verification_service|Exceptions%20per%20Minute'
    )

    // click on the one with an issue
    fireEvent.click(document.body.querySelectorAll('[class*="requestCard"]')[2])
    await waitFor(() =>
      expect(document.body.querySelector('[data-selected="true"] span[data-icon="main-issue"]')).not.toBeNull()
    )
    expect(document.body.querySelector('[class*="requestContainer"] p')?.innerHTML).toEqual(
      'https://harness-test.saas.appdynamics.com/controller/rest/applications/Harness-Dev/metric-data?output=JSON&amp;time-range-type=BEFORE_NOW&amp;duration-in-mins=60&amp;rollup=true&amp;metric-path=Overall%20Application%20Performance|verification_service|Exceptions%20per%20Minute'
    )

    // click on the one with 300
    fireEvent.click(document.body.querySelectorAll('[class*="requestCard"]')[3])
    await waitFor(() =>
      expect(document.body.querySelector('[data-selected="true"] span[data-icon="small-minus"]')).toBeNull()
    )
    expect(document.body.querySelector('[class*="requestContainer"] p')?.innerHTML).toEqual(
      'https://harness-test.saas.appdynamics.com/controller/rest/applications/Harness-Dev/metric-data?output=JSON&amp;time-range-type=BEFORE_NOW&amp;duration-in-mins=60&amp;rollup=true&amp;metric-path=Overall%20Application%20Performance|verification_service|Exceptions%20per%20Minute'
    )

    fireEvent.click(getByText('Back'))
    await waitFor(() => expect(onHideFn).toHaveBeenCalled())
  })
})
