import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CardRailView from '../CardRailView'
import ActiveBuildCard from '../../BuildCards/ActiveBuildCard'

describe('CardRailView', () => {
  test('renders correctly while loading="true"', () => {
    const { container } = render(
      <TestWrapper>
        <CardRailView contentType="ACTIVE_BUILD" isLoading={true} onShowAll={jest.fn()}>
          {[]}
        </CardRailView>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders correctly', () => {
    const { container } = render(
      <TestWrapper>
        <CardRailView contentType="ACTIVE_BUILD" isLoading={false} onShowAll={jest.fn()}>
          {[1, 2, 3].map(val => (
            <ActiveBuildCard key={val} title="Pipeline1" message="This is message" status="PENDING" />
          ))}
        </CardRailView>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders correctly when content is empty', () => {
    const { container } = render(
      <TestWrapper>
        <CardRailView contentType="REPOSITORY" isLoading={false}>
          {[]}
        </CardRailView>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
