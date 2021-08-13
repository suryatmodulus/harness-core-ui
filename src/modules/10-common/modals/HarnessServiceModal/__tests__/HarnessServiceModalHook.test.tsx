import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { useHarnessServicetModal } from '../HarnessServiceModal'

const TestComponent = (): React.ReactElement => {
  const { openHarnessServiceModal, closeHarnessServiceModal } = useHarnessServicetModal({
    data: { name: 'service 101', identifier: 'service_101', orgIdentifier: 'Default', projectIdentifier: 'Demo' },
    isService: true,
    isEdit: false,
    onClose: noop,
    modalTitle: 'New Service',
    onCreateOrUpdate: jest.fn()
  })
  return (
    <>
      <button className="open" onClick={openHarnessServiceModal} />
      <button className="close" onClick={closeHarnessServiceModal} />
    </>
  )
}

describe('open and close Harness Service Modal', () => {
  describe('Rendering', () => {
    test('should open and close the Harness Service modal', async () => {
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
