import React from 'react'
import { render } from '@testing-library/react'
import FailedBuildCard from '../FailedBuildCard'

jest.mock('moment', () => {
  const original = jest.requireActual('moment')
  original().__proto__.fromNow = () => '6 hours ago'
  return original
})

describe('FailedBuildCard', () => {
  test('matches snapshot', () => {
    const { container } = render(
      <FailedBuildCard
        title="Test-Pipeline1"
        message="Fix image secrets in OSS version, a long msg"
        username="John Doe"
        branchName="Master"
        commitId="123sdf2"
        durationMin={32}
        timestamp={1616003810297}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
