/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/display-name */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SectionToggle from '@cf/components/SectionToggle/SectionToggle'

const renderComponent = (path = 'targets') =>
  render(<SectionToggle />, {
    wrapper: props => (
      <TestWrapper
        {...props}
        queryParams={{ activeEnvironment: 'test' }}
        path={`/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/${path}`}
        pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg', projectIdentifier: 'testProject' }}
      />
    )
  })

describe('SectionToggle', () => {
  test('it should render 2 links', async () => {
    renderComponent()
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByText('cf.shared.targets').parentElement?.getAttribute('href')).toContain(
      '/target-management/targets'
    )
    expect(screen.getByText('cf.shared.segments').parentElement?.getAttribute('href')).toContain(
      '/target-management/target-groups'
    )
  })

  test('it should render with Targets selected', async () => {
    renderComponent()
    expect(screen.getByText('cf.shared.targets').parentElement).toHaveClass('active')
    expect(screen.getByText('cf.shared.segments').parentElement).not.toHaveClass('active')
  })

  test('it should render with Target Groups selected', async () => {
    renderComponent('target-groups')
    expect(screen.getByText('cf.shared.segments').parentElement).toHaveClass('active')
    expect(screen.getByText('cf.shared.targets').parentElement).not.toHaveClass('active')
  })
})
