import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import RepositoryCard from '../RepositoryCard'

jest.mock('moment', () => {
  const original = jest.requireActual('moment')
  original().__proto__.fromNow = () => '6 hours ago'
  return original
})

jest.mock('highcharts-react-official', () => () => <div />)

describe('RepositoryCard', () => {
  test('Renders correctly when successRateDiff is positive', () => {
    const { container } = render(
      <TestWrapper>
        <RepositoryCard
          title="Pipeline 1"
          message="This is message"
          username="John Doe"
          durationMin={60}
          startTime={1616003810297}
          buildsNumber={30}
          successRate={60}
          successRateDiff={10}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Renders correctly when successRateDiff is negative', () => {
    const { container } = render(
      <TestWrapper>
        <RepositoryCard
          title="Pipeline 1"
          message="This is message"
          username="John Doe"
          durationMin={60}
          startTime={1616003810297}
          buildsNumber={30}
          successRate={60}
          successRateDiff={-5}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
