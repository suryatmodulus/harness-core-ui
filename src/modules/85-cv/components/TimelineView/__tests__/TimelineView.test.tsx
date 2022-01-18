/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
