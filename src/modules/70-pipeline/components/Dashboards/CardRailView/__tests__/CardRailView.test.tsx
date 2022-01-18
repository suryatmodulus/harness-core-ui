/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
