import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { mockData } from './ChangeTable.mock'
import ChangesTable from '../ChangesTable'

jest.mock('services/cv', () => ({
  useChangeEventList: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))
describe('Change table', () => {
  test('should render with no data', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ChangesTable
          hasChangeSource
          startTime={0}
          endTime={1}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoredServices.noAvailableData')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })
  test('should render with loading state', async () => {
    jest.spyOn(cvService, 'useChangeEventList').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: { message: '' },
          loading: true
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangesTable
          hasChangeSource
          startTime={0}
          endTime={1}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('span[data-icon="steps-spinner"]')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })

  test('should render with error state', async () => {
    const refetch = jest.fn()
    jest.spyOn(cvService, 'useChangeEventList').mockImplementation(
      () =>
        ({
          data: null,
          refetch,
          error: { message: '' },
          loading: false
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <ChangesTable
          hasChangeSource
          startTime={0}
          endTime={1}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )
    await waitFor(() =>
      expect(getByText('We cannot perform your request at the moment. Please try again.')).toBeTruthy()
    )
    act(() => {
      fireEvent.click(getByText('Retry'))
    })

    await waitFor(() =>
      expect(refetch).toHaveBeenLastCalledWith({
        queryParams: {
          endTime: 1,
          envIdentifiers: ['env'],
          pageIndex: 0,
          pageSize: 10,
          serviceIdentifiers: ['srv'],
          startTime: 0
        }
      })
    )

    expect(container).toMatchSnapshot()
  })
  test('should render with change events', () => {
    jest.spyOn(cvService, 'useChangeEventList').mockImplementation(
      () =>
        ({
          data: mockData,
          refetch: jest.fn(),
          error: { message: '' },
          loading: false
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangesTable
          hasChangeSource
          startTime={0}
          endTime={1}
          serviceIdentifier={'srv'}
          environmentIdentifier={'env'}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
