import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { useGetAccountNG, useUpdateAccountDefaultExperienceNG, useUpdateAccountNameNG } from 'services/cd-ng'
import AccountDetails from '../views/AccountDetails'

jest.mock('services/cd-ng')
const useGetAccountNGMock = useGetAccountNG as jest.MockedFunction<any>
const useUpdateAccountDefaultExperienceNGMock = useUpdateAccountDefaultExperienceNG as jest.MockedFunction<any>
const updateAccountNameNGMock = useUpdateAccountNameNG as jest.MockedFunction<any>

const updateAcctDefaultExperienceMock = jest.fn()
const updateAcctNameMock = jest.fn()

beforeEach(() => {
  useGetAccountNGMock.mockImplementation(() => {
    return {
      data: {
        data: {
          name: 'account name',
          identifier: 'id1',
          cluster: 'free',
          defaultExperience: 'NG'
        }
      },
      refetch: jest.fn()
    }
  })

  useUpdateAccountDefaultExperienceNGMock.mockImplementation(() => {
    return {
      mutate: updateAcctDefaultExperienceMock,
      loading: false
    }
  })

  updateAccountNameNGMock.mockImplementation(() => {
    return {
      mutate: updateAcctNameMock,
      loading: false
    }
  })
})

describe('AccountDetails', () => {
  test('should render AccountDetails page with values', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <AccountDetails />
      </TestWrapper>
    )
    expect(getByText('account name')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should call update default version when click save from default version form', async () => {
    const { getByText } = render(
      <TestWrapper>
        <AccountDetails />
      </TestWrapper>
    )
    fireEvent.click(getByText('change'))
    await waitFor(() => expect('common.switchAccount').toBeDefined())
    fireEvent.click(getByText('common.harnessFirstGeneration'))
    fireEvent.click(getByText('save'))
    await waitFor(() => expect(updateAcctDefaultExperienceMock).toHaveBeenCalled())
  })

  test('should call update account name api when edit name and save', async () => {
    const { getByText, container } = render(
      <TestWrapper>
        <AccountDetails />
      </TestWrapper>
    )
    fireEvent.click(container?.getElementsByClassName('bp3-icon-edit')[0])
    await waitFor(() => expect('save').toBeDefined())
    fireEvent.input(queryByNameAttribute('name', container)!, {
      target: { value: 'account name 2' },
      bubbles: true
    })
    fireEvent.click(getByText('save'))
    await waitFor(() => expect(updateAcctNameMock).toHaveBeenCalled())
  })

  test('should show error msg when update account name api call fails', async () => {
    updateAccountNameNGMock.mockImplementation(() => {
      return {
        mutate: jest.fn().mockRejectedValue({
          data: {
            message: 'update name failed'
          }
        })
      }
    })
    const { getByText, container } = render(
      <TestWrapper>
        <AccountDetails />
      </TestWrapper>
    )
    fireEvent.click(container?.getElementsByClassName('bp3-icon-edit')[0])
    await waitFor(() => expect('save').toBeDefined())
    fireEvent.input(queryByNameAttribute('name', container)!, {
      target: { value: 'account name 2' },
      bubbles: true
    })
    fireEvent.click(getByText('save'))
    await waitFor(() => expect(getByText('update name failed')).toBeDefined())
    expect(getByText('account name')).toBeDefined()
  })

  test('should show error msg when update version api call fails', async () => {
    useUpdateAccountDefaultExperienceNGMock.mockImplementation(() => {
      return {
        mutate: jest.fn().mockRejectedValue({
          data: {
            message: 'update version failed'
          }
        })
      }
    })
    const { getByText } = render(
      <TestWrapper>
        <AccountDetails />
      </TestWrapper>
    )
    fireEvent.click(getByText('change'))
    await waitFor(() => expect('common.switchAccount').toBeDefined())
    fireEvent.click(getByText('common.harnessFirstGeneration'))
    fireEvent.click(getByText('save'))
    await waitFor(() => expect(getByText('update version failed')).toBeDefined())
    expect(getByText('common.harnessNextGeneration')).toBeDefined()
  })
})
