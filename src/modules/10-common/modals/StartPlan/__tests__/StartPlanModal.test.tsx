import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import useStartTrialModal from '../StartPlanModal'

const TestComponent = (): React.ReactElement => {
  const { showModal, hideModal } = useStartTrialModal({
    handleStartPlan: jest.fn(),
    module: 'ce'
  })
  return (
    <>
      <button className="open" onClick={showModal} />
      <button className="close" onClick={hideModal} />
    </>
  )
}

describe('open and close Start Trial Modal', () => {
  describe('Rendering', () => {
    test('should open and close the start trial modal', async () => {
      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)

      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()
    })
  })
})
