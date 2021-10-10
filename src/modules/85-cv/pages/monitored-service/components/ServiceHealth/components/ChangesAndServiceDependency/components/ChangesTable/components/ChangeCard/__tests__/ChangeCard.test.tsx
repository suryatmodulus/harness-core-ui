import React from 'react'
import { render, waitFor } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import ChangeCard from '../ChangeCard'
import { payload } from './ChangeCard.mock'
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
    const { container, getByText } = render(
      <TestWrapper>
        <ChangeCard activityId={'dasda'} />
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
        <ChangeCard activityId={'dasda'} />
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
        <ChangeCard activityId={'dasda'} />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(getByText('We cannot perform your request at the moment. Please try again.')).toBeTruthy()
    )

    expect(container).toMatchSnapshot()
  })
})
