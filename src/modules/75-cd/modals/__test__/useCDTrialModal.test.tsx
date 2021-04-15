import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useCDTrialModal } from '../CDTrial/useCDTrialModal'

const onCloseModal = jest.fn()
const TestComponent = (): React.ReactElement => {
  const { openCDTrialModal, closeCDTrialModal } = useCDTrialModal({
    onSuccess: jest.fn(),
    onCloseModal
  })
  return (
    <>
      <button className="open" onClick={openCDTrialModal} />
      <button className="close" onClick={closeCDTrialModal} />
    </>
  )
}

describe('open and close CDTrial Modal', () => {
  describe('Rendering', () => {
    test('should open and close CDTrial', async () => {
      const { container, getByText, getByRole } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('Trial in-progress')).toBeDefined())
      fireEvent.click(getByRole('button', { name: 'close modal' }))
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })

    test('should close modal by closeCDTrialModal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('Trial in-progress')).toBeDefined())
      fireEvent.click(container.querySelector('.close')!)
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })
  })
})
