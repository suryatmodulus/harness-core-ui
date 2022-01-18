/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TimelineBar } from '../TimelineBar'

jest.mock('moment', () => {
  const original = jest.requireActual('moment')
  original().__proto__.format = () => 'XX:YY'
  return original
})

describe('TimelineBar', () => {
  test('matches snapshot', () => {
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      height: 10,
      width: 300,
      x: 0,
      y: 0,
      toJSON: jest.fn()
    }))

    const { container } = render(<TimelineBar startDate={1603718023322} endDate={1603761223322} />)
    expect(container).toMatchSnapshot()
    jest.resetAllMocks()
  })
})
