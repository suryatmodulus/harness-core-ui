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
