/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { createRenderer } from 'react-test-renderer/shallow'
import AdminRouteDestinations from '@cf/components/routing/AdminRouteDestinations'

describe('AdminRouteDestinations', () => {
  test('it should return the admin routes', () => {
    const renderer = createRenderer()
    renderer.render(<AdminRouteDestinations />)

    expect(renderer.getRenderOutput()).toMatchSnapshot()
  })
})
