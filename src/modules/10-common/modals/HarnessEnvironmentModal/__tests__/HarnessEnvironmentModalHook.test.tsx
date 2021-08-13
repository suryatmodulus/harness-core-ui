import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { useHarnessEnvironmentModal } from '../HarnessEnvironmentModal'

const TestComponent = (): React.ReactElement => {
  const { openHarnessEnvironmentModal, closeHarnessEnvironmentModal } = useHarnessEnvironmentModal({
    data: {},
    isEnvironment: true,
    isEdit: false,
    onClose: noop,
    modalTitle: 'New Environment',
    onCreateOrUpdate: jest.fn()
  })
  return (
    <>
      <button className="open" onClick={openHarnessEnvironmentModal} />
      <button className="close" onClick={closeHarnessEnvironmentModal} />
    </>
  )
}

describe('open and close Harness Environment Modal', () => {
  describe('Rendering', () => {
    test('should open and close the Harness Environment modal', async () => {
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
