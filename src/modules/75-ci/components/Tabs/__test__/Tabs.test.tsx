/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
