import React from 'react'
import { render } from '@testing-library/react'
import ExtendedPageBody from '../ExtendedPageBody'

describe('ExtendedPageBody snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <ExtendedPageBody>
        <div />
      </ExtendedPageBody>
    )
    expect(container).toMatchSnapshot()
  })
})
