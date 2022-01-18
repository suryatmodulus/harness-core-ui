/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import useChooseProvisioner from './ChooseProvisioner'

const TestComponent = (): React.ReactElement => {
  const { showModal, hideModal } = useChooseProvisioner({
    onSubmit: jest.fn(),
    onClose: jest.fn()
  })
  return (
    <>
      <button className="open" onClick={showModal} />
      <button className="close" onClick={hideModal} />
    </>
  )
}
describe('Choose Provisioner tests', () => {
  test('render dialog for choosing provisioner type', () => {
    const { container } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
