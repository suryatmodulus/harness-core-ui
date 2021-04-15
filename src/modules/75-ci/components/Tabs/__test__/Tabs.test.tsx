import React from 'react'
import { render } from '@testing-library/react'
import { Tab, Tabs } from '../Tabs'

describe('Tabs snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <Tabs id="tabs">
        <Tab id="tab1" title={'Tab1'} />
      </Tabs>
    )
    expect(container).toMatchSnapshot()
  })
})
