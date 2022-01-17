/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegatesListingItem, { DelegateListingHeader } from '../DelegateListingItem'
import { delegateGroupsMock } from './DelegateGroupsMock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const setOpenTroubleshoterFn = jest.fn()

jest.mock('services/portal', () => ({
  useDeleteDelegateGroupByIdentifier: () => ({
    mutate: jest.fn()
  })
}))

describe('DelegateListingHeader test', () => {
  test('render DelegateListingHeader', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateListingHeader />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Delegates Listing With Groups', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegatesListingItem delegate={delegateGroupsMock[0]} setOpenTroubleshoter={setOpenTroubleshoterFn} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Click on item', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegatesListingItem delegate={delegateGroupsMock[0]} setOpenTroubleshoter={setOpenTroubleshoterFn} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(container.firstChild!)
    })
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
