import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { usePlanModal } from '../usePlanModal'

const onCloseModal = jest.fn()
const TestComponent = (): React.ReactElement => {
  const { openPlanModal, closePlanModal } = usePlanModal({
    module: 'cd',
    icon: 'cd-main',
    unitPrice: 175,
    onCloseModal,
    contactSalesThreshold: 25
  })
  return (
    <>
      <button className="open" onClick={openPlanModal} />
      <button className="close" onClick={closePlanModal} />
    </>
  )
}
describe('Plan Modal', () => {
  describe('Rendering', () => {
    test('should open and close Plan Modal', async () => {
      const { container, getByText, getByRole } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('common.license.planForm.title')).toBeDefined())
      fireEvent.click(getByRole('button', { name: 'close modal' }))
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })

    test('should close modal by closePlanModal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('common.license.planForm.title')).toBeDefined())
      fireEvent.click(container.querySelector('.close')!)
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })
  })
})
