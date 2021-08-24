import { Classes } from '@blueprintjs/core'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import CVProgressBar from '../CVProgressBar'

describe('Unit tests for CVProgressBar', () => {
  test('Ensure progress bar is colored correctly basede on status', async () => {
    const { container, rerender } = render(<CVProgressBar status="ERROR" value={45} />)
    await waitFor(() => expect(container.querySelector(`[class*="${Classes.INTENT_DANGER}"]`)).not.toBeNull())
    expect(container.querySelector(`[class*="${Classes.PROGRESS_METER}"]`)?.getAttribute('style')).toEqual(
      'width: 45%;'
    )

    rerender(<CVProgressBar status="IN_PROGRESS" value={33} />)
    await waitFor(() => expect(container.querySelector(`[class*="${Classes.INTENT_PRIMARY}"]`)).not.toBeNull())
    expect(container.querySelector(`[class*="${Classes.PROGRESS_METER}"]`)?.getAttribute('style')).toEqual(
      'width: 33%;'
    )

    rerender(<CVProgressBar status="VERIFICATION_PASSED" value={22} />)
    await waitFor(() => expect(container.querySelector(`[class*="${Classes.INTENT_SUCCESS}"]`)).not.toBeNull())
    expect(container.querySelector(`[class*="${Classes.PROGRESS_METER}"]`)?.getAttribute('style')).toEqual(
      'width: 22%;'
    )

    rerender(<CVProgressBar status="VERIFICATION_FAILED" value={25} />)
    await waitFor(() => expect(container.querySelector(`[class*="${Classes.INTENT_DANGER}"]`)).not.toBeNull())
    expect(container.querySelector(`[class*="${Classes.PROGRESS_METER}"]`)?.getAttribute('style')).toEqual(
      'width: 25%;'
    )
  })
})
