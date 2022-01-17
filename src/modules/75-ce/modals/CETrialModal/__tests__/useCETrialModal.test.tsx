/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import useCETrialModal from '../useCETrialModal'

moment.now = jest.fn(() => 1482363367071)

const TestComponent = (): React.ReactElement => {
  const { showModal, hideModal } = useCETrialModal({ onContinue: () => void 0 })
  return (
    <>
      <button className="open" onClick={showModal} />
      <button className="close" onClick={hideModal} />
    </>
  )
}

describe('open and close the CE Trial Modal', () => {
  describe('Rendering', () => {
    test('should open  the start trial modal', async () => {
      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)

      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()
    })

    test('should close the start trial modal', async () => {
      const { container } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.close')!)

      const dialog = findDialogContainer() as HTMLElement
      expect(dialog).toMatchSnapshot()
    })
  })
})
