import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RemoveSubSectionButton from '../RemoveSubSectionButton'

describe('RemoveSubSectionButton', () => {
  test('it should call the onClick handler when the button is pressed', async () => {
    const onClick = jest.fn()
    render(<RemoveSubSectionButton onClick={onClick} />)

    userEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(onClick).toHaveBeenCalled()
    })
  })
})
