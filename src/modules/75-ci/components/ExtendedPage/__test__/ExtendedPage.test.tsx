import React from 'react'
import { render } from '@testing-library/react'
import ExtendedPage from '../ExtendedPage'

describe('ExtendedPage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <ExtendedPage>
        <div />
      </ExtendedPage>
    )
    expect(container).toMatchSnapshot()
  })
})
