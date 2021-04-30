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
        startTime={1616003810297}
        endTime={1616003810297 + 5 * 60000}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('matches snapshot when commitId is long', () => {
    const { container } = render(
      <FailedBuildCard
        title="Test-Pipeline1"
        message="Fix image secrets in OSS version, a long msg"
        username="John Doe"
        branchName="Master"
        commitId="123sdf2123123123123"
        startTime={1616003810297}
        endTime={1616003810297 + 5 * 60000}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
