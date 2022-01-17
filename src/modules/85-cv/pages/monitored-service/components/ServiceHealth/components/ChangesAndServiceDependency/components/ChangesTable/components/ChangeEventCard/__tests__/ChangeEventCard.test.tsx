/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import ChangeEventCard from '../ChangeEventCard'
import { HarnessCDMockData, HarnessNextGenMockData, payload } from './ChangeEventCard.mock'

jest.mock('@cv/components/TimelineView/TimelineBar', () => ({
  TimelineBar: function MockComponent() {
    return <div />
  }
}))

describe('Validate ChangeCard', () => {
  test('should render Pager Duty card', async () => {
    jest.spyOn(cvService, 'useGetChangeEventDetail').mockImplementation(
      () =>
        ({
          data: payload,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv').mockReturnValue({
      data: {},
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <ChangeEventCard activityId={'dasda'} />
      </TestWrapper>
    )
    // Card Title is rendered Correctly
    await waitFor(() => expect(getByText(payload.resource.id)).toBeTruthy())
    await waitFor(() => expect(getByText(payload.resource.name)).toBeTruthy())
    await waitFor(() => expect(getByText(payload.resource.metadata.status)).toBeTruthy())

    // Card details title
    await waitFor(() => expect(getByText(`PagerDuty Alert details`)).toBeTruthy())

    expect(container).toMatchSnapshot()
  })

  test('should render Deployment Harness NextGen card', async () => {
    jest.spyOn(cvService, 'useGetChangeEventDetail').mockImplementation(
      () =>
        ({
          data: HarnessNextGenMockData,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv').mockReturnValue({
      data: {},
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)
    const { getByText } = render(
      <TestWrapper>
        <ChangeEventCard activityId={'dasda'} />
      </TestWrapper>
    )
    // Card Title is rendered Correctly
    await waitFor(() => expect(getByText(HarnessNextGenMockData.resource.id)).toBeTruthy())
    await waitFor(() => expect(getByText(HarnessNextGenMockData.resource.name)).toBeTruthy())
    await waitFor(() => expect(getByText(HarnessNextGenMockData.resource.metadata.status)).toBeTruthy())

    // Card details title
    await waitFor(() => expect(getByText(`HarnessCDNextGen Deployment details`)).toBeTruthy())
  })

  test('should render Deployment HarnessCD card', async () => {
    jest.spyOn(cvService, 'useGetChangeEventDetail').mockImplementation(
      () =>
        ({
          data: HarnessCDMockData,
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    jest.spyOn(cvService, 'useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv').mockReturnValue({
      data: {},
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)
    const { getByText } = render(
      <TestWrapper>
        <ChangeEventCard activityId={'dasda'} />
      </TestWrapper>
    )
    // Card Title is rendered Correctly
    await waitFor(() => expect(getByText(HarnessCDMockData.resource.id)).toBeTruthy())
    await waitFor(() => expect(getByText(HarnessCDMockData.resource.name)).toBeTruthy())

    // Card details title
    await waitFor(() => expect(getByText(`HarnessCD Deployment details`)).toBeTruthy())
  })

  test('should render in loading state', async () => {
    jest.spyOn(cvService, 'useGetChangeEventDetail').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: null,
          loading: true
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangeEventCard activityId={'dasda'} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('span[data-icon="steps-spinner"]')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })

  test('should render in error state', async () => {
    jest.spyOn(cvService, 'useGetChangeEventDetail').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: true,
          loading: false
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <ChangeEventCard activityId={'dasda'} />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(getByText('We cannot perform your request at the moment. Please try again.')).toBeTruthy()
    )

    expect(container).toMatchSnapshot()
  })
})
