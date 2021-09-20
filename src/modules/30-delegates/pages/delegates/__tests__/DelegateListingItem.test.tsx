import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegatesListingItem from '../DelegateListingItem'
import { delegateGroupsMock } from './DelegateGroupsMock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const setOpenTroubleshoterFn = jest.fn()

jest.mock('services/portal', () => ({
  useDeleteDelegateGroupByIdentifier: () => ({
    mutate: jest.fn()
  })
}))

describe('Delegates Listing With Groups', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegatesListingItem delegate={delegateGroupsMock[0]} setOpenTroubleshoter={setOpenTroubleshoterFn} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('click on delegate item action', async () => {
    const { getAllByText, container } = render(
      <TestWrapper>
        <DelegatesListingItem delegate={delegateGroupsMock[1]} setOpenTroubleshoter={setOpenTroubleshoterFn} />
      </TestWrapper>
    )
    fireEvent.click(getAllByText('delegates.troubleshootOption')[0]!)
    expect(container).toMatchSnapshot()
  })
})
