/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import { Collapse } from './Collapse'

describe('<Collapse /> tests', () => {
  test('toggle works', () => {
    const { container, getByTestId } = render(
      <Collapse title="Hello World!">
        <div data-testid="content">Lorem Ipsum</div>
      </Collapse>
    )

    expect(() => getByTestId('content')).toThrow()
    expect(container).toMatchSnapshot()

    const toggle = getByTestId('toggle-collapse')

    fireEvent.click(toggle)

    const content = getByTestId('content')

    expect(content).toBeTruthy()

    expect(container).toMatchSnapshot()
  })
})
