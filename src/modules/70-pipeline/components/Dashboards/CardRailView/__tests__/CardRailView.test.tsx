import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CardRailView from '../CardRailView'

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
