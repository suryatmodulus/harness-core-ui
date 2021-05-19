import React from 'react'
import { render, fireEvent, waitFor, getByTestId, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegatesListing from '../DelegateListing'
import {
  multipleDelegatesMock,
  singleDelegateResponseMock,
  singleDelegateWithoutTagsResponseMock
} from './DelegateGroupsMock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => {
  const ComponentToMock: React.ElementType = () => <div>yamlDiv</div>
  return ComponentToMock
})

jest.mock('services/portal', () => ({
  useGetDelegateGroupsV2: ({ queryParams: { accountId } }: any) => {
    let data
    if (accountId === 'singleDelegateWithoutTags') {
      data = singleDelegateWithoutTagsResponseMock
    } else if (accountId === 'multipleDelegates') {
      data = multipleDelegatesMock
    } else {
      data = singleDelegateResponseMock
    }
    return {
      data,
      refetch: jest.fn()
    }
  },
  useDeleteDelegateGroup: () => ({
    mutate: jest.fn()
  })
}))

jest.mock('@common/hooks/useFeatureFlag', () => ({
  useFeatureFlags: () => ({ DELEGATE_INSIGHTS_ENABLED: true })
}))

describe('Feature flag enabled', () => {
  test('render delegates list and check for activity column', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'simpleDelegateResponse' }}>
        <DelegatesListing />
      </TestWrapper>
    )
    expect(container.innerHTML.search('ACTIVITY')).toBeGreaterThan(-1)
    expect(container).toMatchSnapshot()
  })

  test('render delegate list and test new delegate button', async () => {
    const { getByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'simpleDelegateResponse' }}>
        <DelegatesListing />
      </TestWrapper>
    )
    fireEvent.click(getByText('delegate.NEW_DELEGATE'))
    await waitFor(() => {
      expect(document.body.querySelector('.bp3-dialog')).toBeDefined()
    })
  })
})

describe('Delegates Listing With Groups', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'multipleDelegates' }}>
        <DelegatesListing />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('click on delegate row', async () => {
    const { getAllByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'multipleDelegates' }}>
        <DelegatesListing />
      </TestWrapper>
    )
    fireEvent.click(getAllByText('connected')[0])
    await waitFor(() => {
      getByTestId(container, 'location').innerText &&
        expect(getByTestId(container, 'location').innerText).toContain(
          '/account/multipleDelegates/admin/resources/delegates/delegate1'
        )
    })
  })
})

describe('Delegates Listing without tags', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/resources/delegates"
        pathParams={{ accountId: 'singleDelegateWithoutTags' }}
      >
        <DelegatesListing />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Delegates Listing test actions', () => {
  test('render data and click delete', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/resources/delegates"
        pathParams={{ accountId: 'singleDelegateWithoutTags' }}
      >
        <DelegatesListing />
      </TestWrapper>
    )

    const optionBtn = container.getElementsByTagName('button')[0]
    act(() => {
      fireEvent.click(optionBtn!)
    })

    expect(container).toMatchSnapshot()
  })
})
