import React from 'react'
import { render, fireEvent, waitFor, getByTestId, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegatesListing from '../DelegateListing'
import {
  multipleDelegatesMock,
  singleDelegateResponseMock,
  singleDelegateWithoutTagsResponseMock
} from './DelegateGroupsMock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const fetchDelFn = jest.fn().mockImplementation((_sanitizedFilterRequest, { queryParams: { accountId } }) => {
  let data
  if (accountId === 'singleDelegateWithoutTags') {
    data = singleDelegateWithoutTagsResponseMock
  } else if (accountId === 'multipleDelegates') {
    data = multipleDelegatesMock
  } else {
    data = singleDelegateResponseMock
  }
  return data
})

jest.mock('services/portal', () => ({
  useGetDelegateGroupsNGV2WithFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: fetchDelFn,
      loading: false
    }
  }),
  useDeleteDelegateGroupByIdentifier: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetFilterList: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  usePostFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useUpdateFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useDeleteFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  })
}))

describe('Feature flag enabled', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('render delegates list and check for activity column', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'simpleDelegateResponse' }}>
        <DelegatesListing />
      </TestWrapper>
    )
    expect(container.innerHTML.search('ACTIVITY')).toBeGreaterThan(-1)
    expect(container).toMatchSnapshot()
  })

  test('render delegate list and test new delegate button', async () => {
    const { getAllByText } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'simpleDelegateResponse' }}>
        <DelegatesListing />
      </TestWrapper>
    )
    act(async () => {
      await waitFor(() => {
        const delNames = getAllByText('delegate.DelegateName')
        fireEvent.click(delNames[0]!)
      })
    })
    await waitFor(() => {
      expect(document.body.querySelector('.bp3-dialog')).toBeDefined()
    })
  })
})

describe('Delegates Listing With Groups', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('render data', () => {
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
    act(async () => {
      await waitFor(() => {
        const connected = getAllByText('connected')
        fireEvent.click(connected[0])
      })
    })
    await waitFor(() => {
      getByTestId(container, 'location').innerText &&
        expect(getByTestId(container, 'location').innerText).toContain(
          '/account/multipleDelegates/admin/resources/delegates/delegate1'
        )
    })
  })
})

describe('Delegates Listing without tags', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('render data', () => {
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
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('render data and click delete', () => {
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

describe('Delegate Listing, open filter', () => {
  test.only('render list and open filter', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/resources/delegates"
        pathParams={{ accountId: 'singleDelegateWithoutTags' }}
      >
        <DelegatesListing />
      </TestWrapper>
    )

    let buttons: HTMLCollectionOf<HTMLButtonElement>
    await waitFor(() => {
      buttons = container.getElementsByTagName('button')
    })

    act(() => {
      fireEvent.click(buttons[1]!)
    })

    expect(container).toMatchSnapshot()
  })
})
