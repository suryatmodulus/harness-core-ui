import React from 'react'
import { render } from '@testing-library/react'
import TimelineView from '../TimelineView'

describe('TimelineView', () => {
  test('matches snapshot', () => {
    const { container } = render(
      <TimelineView
        startTime={1603718023322}
        endTime={1603761223322}
        rows={[
          {
            name: 'Test Row',
            data: [{ startTime: 1603718023400, name: 'test_name' }]
          }
        ]}
        renderItem={item => <div>${item.name}</div>}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
