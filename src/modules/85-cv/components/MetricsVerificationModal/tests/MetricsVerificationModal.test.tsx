/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import type { AppdynamicsValidationResponse } from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import MetricsVerificationModal from '../MetricsVerificationModal'

const MockVerificationData: AppdynamicsValidationResponse[] = [
  {
    metricPackName: 'Metric pack 1',
    overallStatus: 'SUCCESS',
    values: [
      { value: 60.367792195971866, apiResponseStatus: 'SUCCESS', metricName: 'Apdex' },
      { value: 0.00029761904761904765, apiResponseStatus: 'SUCCESS', metricName: 'Average Response Time (ms)' },
      { value: 9823, apiResponseStatus: 'SUCCESS', metricName: 'Errors per Minute' },
      { value: 0, apiResponseStatus: 'SUCCESS', metricName: 'Calls per Minute' }
    ]
  },
  {
    metricPackName: 'Metric pack 2',
    overallStatus: 'SUCCESS',
    values: [
      { value: 0, apiResponseStatus: 'NO_DATA', metricName: 'Apdex' },
      { value: 0, apiResponseStatus: 'NO_DATA', metricName: 'Average Response Time (ms)' },
      { value: 0, apiResponseStatus: 'FAILED', metricName: 'Errors per Minute', errorMessage: 'Error Metric' }
    ]
  }
]

jest.mock('../../ThirdPartyCallLogs/ThirdPartyCallLogs', () => ({
  ThirdPartyCallLogModal: function Mock(props: any) {
    return <div className="thirdpartycalllogs" onClick={() => props.onBackButtonClick()} />
  }
}))

describe('MetricsVerificationModal unit tests', () => {
  test('Ensure mock data is rendered correctly', async () => {
    const onHideMock = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <MetricsVerificationModal
          verificationData={MockVerificationData}
          verificationType="AppDynamics"
          guid="sdfsdf"
          onHide={onHideMock}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('cv.metricVerificationModal.modalTitle')))

    // verify total cards and their content
    expect(document.body.querySelectorAll('[class*="successCard"]').length).toBe(4)
    expect(document.body.querySelectorAll('[class*="noDataCard"]').length).toBe(2)
    expect(document.body.querySelectorAll('[class*="errorCard"]').length).toBe(1)

    expect(
      document.body.querySelector('[class*="errorCard"]')?.querySelector('[class*="smallFont"]')?.innerHTML
    ).toEqual('Error Metric')

    // verify that when you click on failures only error cards are shown
    fireEvent.click(getByText('CV.FAILURES'))
    await waitFor(() => expect(document.body.querySelectorAll('[class*="statusCard"]').length).toBe(1))

    // click on view calls logs and make sure 3rd party call logs are displayed and hit back button
    fireEvent.click(getByText('cv.metricVerificationModal.viewCalls'))
    await waitFor(() => expect(document.querySelector('[class*="thirdpartycalllogs"]')).not.toBeNull())
    expect(document.body.querySelectorAll('[class*="statusCard"]').length).toBe(0)
    let backButton = document.querySelector('[class*="thirdpartycalllogs"]')
    if (!backButton) {
      throw Error('button not rendered.')
    }

    fireEvent.click(backButton)
    await waitFor(() => expect(document.body.querySelectorAll('[class*="statusCard"]').length).toBe(7))

    fireEvent.click(getByText('SUCCESS'))
    await waitFor(() => expect(document.body.querySelectorAll('[class*="statusCard"]').length).toBe(4))

    fireEvent.click(getByText('NODATA'))
    await waitFor(() => expect(document.body.querySelectorAll('[class*="statusCard"]').length).toBe(2))

    // click on view calls logs and make sure 3rd party call logs are displayed
    fireEvent.click(getByText('cv.metricVerificationModal.viewCalls'))
    await waitFor(() => expect(document.querySelector('[class*="thirdpartycalllogs"]')).not.toBeNull())
    expect(document.body.querySelectorAll('[class*="statusCard"]').length).toBe(0)

    backButton = document.querySelector('[class*="thirdpartycalllogs"]')
    if (!backButton) {
      throw Error('button not rendered.')
    }

    fireEvent.click(backButton)
    await waitFor(() => expect(document.body.querySelectorAll('[class*="statusCard"]').length).toBe(7))

    const closeButton = document.body.querySelector('button[aria-label="Close"]')
    if (!closeButton) {
      throw Error('Close button was not rendered')
    }

    fireEvent.click(closeButton)
    await waitFor(() => expect(onHideMock).toHaveBeenCalled())
  })
})
