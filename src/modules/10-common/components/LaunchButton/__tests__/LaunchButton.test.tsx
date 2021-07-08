import React from 'react'
import { render } from '@testing-library/react'
import { LaunchButton } from '../LaunchButton'

describe('Launch Button test', () => {
  test('Launch button render ', async () => {
    const { container } = render(
      <LaunchButton launchButtonText="Launch Next Generation" redirectUrl="#/account/abc123/dashboard" />
    )
    expect(container).toMatchSnapshot()
  })
})
