/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useContactSalesModal } from '../useContactSalesModal'

const onCloseModal = jest.fn()
const TestComponent = (): React.ReactElement => {
  const { openContactSalesModal, closeContactSalesModal } = useContactSalesModal({
    onSubmit: jest.fn(),
    onCloseModal
  })
  return (
    <>
      <button className="open" onClick={openContactSalesModal} />
      <button className="close" onClick={closeContactSalesModal} />
    </>
  )
}
describe('Contact Sales Modal', () => {
  describe('Rendering', () => {
    test('should open and close Contact Sales Modal', async () => {
      const { container, getByText, getByRole } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('common.banners.trial.contactSales')).toBeDefined())
      fireEvent.click(getByRole('button', { name: 'close modal' }))
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })

    test('should close modal by closeContactSalesModal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('common.banners.trial.contactSales')).toBeDefined())
      fireEvent.click(container.querySelector('.close')!)
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })
  })

  describe('Validation', () => {
    test('should validate', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('common.banners.trial.contactSales')).toBeDefined())
      fireEvent.click(getByText('submit'))
      await waitFor(() => expect(() => getByText('Name is a required field')).toBeDefined())
      expect(() => getByText('Email is required')).toBeDefined()
      expect(() => getByText('Country is required')).toBeDefined()
      expect(() => getByText('Phone is required')).toBeDefined()
      expect(() => getByText('Role is required')).toBeDefined()
      expect(() => getByText('Organization Name is required')).toBeDefined()
      expect(() => getByText('Company Size is required')).toBeDefined()
    })
  })
})
