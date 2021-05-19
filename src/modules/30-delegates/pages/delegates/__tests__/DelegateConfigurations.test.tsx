import React from 'react'
import { fireEvent, act, render, queryAllByAttribute } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigurations from '../DelegateConfigurations'
import ProfileMock from './ProfilesMock'

const mockGetCallFunction = jest.fn()
jest.mock('services/cd-ng', () => ({
  useListDelegateProfilesNg: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: ProfileMock, refetch: jest.fn(), error: null, loading: false }
  }),
  useDeleteDelegateProfileNg: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useAddDelegateProfileNg: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  }))
}))

jest.mock('@common/exports', () => ({
  TimeAgo: jest.fn().mockImplementation(() => <div />),
  useConfirmationDialog: jest.fn().mockImplementation(() => ({ openDialog: jest.fn() }))
}))

describe('Delegates Configurations Page', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('render data and add new', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    const addBtn = container.getElementsByTagName('button')[0]
    act(() => {
      fireEvent.click(addBtn)
    })

    expect(container).toMatchSnapshot()
  })
})

describe('Delegates Configurations Test Click', () => {
  test('render component edit click', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    const menuBtn = queryAllByAttribute('data-icon', document.body, 'more')[0]
    act(() => {
      fireEvent.click(menuBtn!)
    })

    const editOption = queryAllByAttribute('data-icon', document.body, 'edit')[0]
    act(() => {
      fireEvent.click(editOption)
    })

    expect(container).toMatchSnapshot()
  })

  test('render component delete click', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    const menuBtn = queryAllByAttribute('data-icon', document.body, 'more')[0]
    act(() => {
      fireEvent.click(menuBtn!)
    })

    const deleteOption = queryAllByAttribute('data-icon', document.body, 'cross')[0]
    act(() => {
      fireEvent.click(deleteOption)
    })

    expect(container).toMatchSnapshot()
  })
})
