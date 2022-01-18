/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ChangeSourceTableContainer from '../ChangeSourceTableContainer'

const onSuccess = jest.fn()
const onEdit = jest.fn()
const onAddNewChangeSource = jest.fn()
const props = {
  value: [{ name: 'adadas', identifier: 'adadas', type: 'HarnessCD', enabled: true, spec: {}, category: 'Deployment' }],
  onEdit,
  onSuccess,
  onAddNewChangeSource
}
describe('Test ChangeSourceTable', () => {
  test('should render', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ChangeSourceTableContainer {...props} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.changeSource.addChangeSource')).toBeTruthy())
    act(() => {
      fireEvent.click(getByText('cv.changeSource.addChangeSource'))
      expect(container).toMatchSnapshot()
    })
    await waitFor(() => expect(onAddNewChangeSource).toHaveBeenCalled())
    await waitFor(() => expect(container.querySelector('.TableV2--body div[role="row"]')).toBeTruthy())
    act(() => {
      fireEvent.click(getByText('adadas'))
    })
    await waitFor(() =>
      expect(onEdit).toHaveBeenCalledWith({
        isEdit: true,
        onSuccess: onSuccess,
        rowdata: {
          category: 'Deployment',
          enabled: true,
          identifier: 'adadas',
          name: 'adadas',
          spec: {},
          type: 'HarnessCD'
        },
        tableData: [
          { category: 'Deployment', enabled: true, identifier: 'adadas', name: 'adadas', spec: {}, type: 'HarnessCD' }
        ]
      })
    )
    expect(container).toMatchSnapshot()
  })
})
