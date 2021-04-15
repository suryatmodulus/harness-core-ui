import React from 'react'
import { render } from '@testing-library/react'
import { ExtendedPageHeader } from '../ExtendedPageHeader'

describe('ExtendedPageHeader snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(<ExtendedPageHeader title={'title'} rowOneContent={<div />} rowTwoContent={<div />} />)
    expect(container).toMatchSnapshot()
  })
})
