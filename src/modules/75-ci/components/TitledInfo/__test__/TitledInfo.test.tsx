import React from 'react'
import { render } from '@testing-library/react'
import { TitledInfo } from '../TitledInfo'

describe('TitledInfo snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(<TitledInfo title={'title1'} value={'value1'} />)
    expect(container).toMatchSnapshot()
  })
})
