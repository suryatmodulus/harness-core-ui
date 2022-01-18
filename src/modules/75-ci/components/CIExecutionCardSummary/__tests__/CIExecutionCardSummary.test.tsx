/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { CIExecutionCardSummary } from '../CIExecutionCardSummary'

import pullRequestProps from './pullRequestProps.json'
import branchProps from './branchProps.json'
import otherProps from './otherProps.json'

describe('<CIExecutionCardSummary /> tests', () => {
  test('pull request snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <CIExecutionCardSummary {...(pullRequestProps as any)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('branch snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <CIExecutionCardSummary {...(branchProps as any)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('default snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <CIExecutionCardSummary {...(otherProps as any)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
