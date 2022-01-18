/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import RepositoryCard from '../RepositoryCard'

jest.mock('moment', () => {
  const original = jest.requireActual('moment')
  original().__proto__.fromNow = () => 'SOME_FIXED_TIME'
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
          startTime={1616003810297}
          endTime={1616007410297}
          count={30}
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
          startTime={1616003810297}
          endTime={1616007410297}
          count={30}
          successRate={60}
          successRateDiff={-5}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
