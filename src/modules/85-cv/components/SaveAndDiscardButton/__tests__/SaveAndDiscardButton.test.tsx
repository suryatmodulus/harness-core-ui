/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SaveAndDiscardButton from '../SaveAndDiscardButton'

const onSave = jest.fn()
const onDiscard = jest.fn()
describe('Validate SaveAndDiscardButton', () => {
  test('SaveAndDiscardButton isUpdated true', async () => {
    const props = {
      isUpdated: true,
      onSave,
      onDiscard
    }
    const { container, getByText } = render(
      <TestWrapper>
        <SaveAndDiscardButton {...props} />
      </TestWrapper>
    )

    expect(getByText('save')).toBeDefined()
    expect(getByText('unsavedChanges')).toBeDefined()
    expect(getByText('common.discard')).toBeDefined()

    expect(getByText('common.discard')).not.toBeDisabled()

    await act(async () => {
      fireEvent.click(getByText('save'))
    })

    expect(onSave).toHaveBeenCalled()

    await act(async () => {
      fireEvent.click(getByText('common.discard'))
    })

    expect(onDiscard).toHaveBeenCalled()

    expect(container).toMatchSnapshot()
  })
  test('SaveAndDiscardButton isUpdated false', async () => {
    const props = {
      isUpdated: false,
      onSave,
      onDiscard
    }
    const { container, getByText } = render(
      <TestWrapper>
        <SaveAndDiscardButton {...props} />
      </TestWrapper>
    )

    expect(getByText('save')).toBeDefined()
    expect(getByText('common.discard')).toBeDefined()

    expect(container.querySelector('.discardBtn')).toBeDisabled()

    expect(container).toMatchSnapshot()
  })
})
