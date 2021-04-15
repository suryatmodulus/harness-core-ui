import React from 'react'
import { render } from '@testing-library/react'
import RightBar from '../RightBar'

describe('RightBar snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(<RightBar />)
    expect(container).toMatchSnapshot()
  })
})
