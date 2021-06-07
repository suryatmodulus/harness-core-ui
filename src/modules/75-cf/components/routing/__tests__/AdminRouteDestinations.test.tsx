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
