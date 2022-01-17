/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'

import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import { FlagPrerequisites } from '../FlagPrerequisites'

jest.mock('services/cf', () => ({
  useGetAllFeatures: jest.fn().mockReturnValue({ data: [], loading: false }),
  usePatchFeature: jest.fn().mockReturnValue({ mutate: jest.fn(), loading: false })
}))

jest.mock('@cf/hooks/useEnvironmentSelectV2', () => ({
  useEnvironmentSelectV2: jest.fn().mockReturnValue({ data: [], loading: false })
}))

const renderComponent = (): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagPrerequisites gitSync={mockGitSync} featureFlag={mockFeature} refetchFlag={jest.fn()} />
    </TestWrapper>
  )
}

describe('FlagPrerequisites', () => {
  test('it should render correctly', async () => {
    renderComponent()

    await waitFor(() => expect(screen.getByText('cf.shared.prerequisites')).toBeInTheDocument())
    userEvent.click(screen.getByText('cf.shared.prerequisites'))

    await waitFor(() => expect(screen.getByTestId('add-prerequisites-button')).toBeInTheDocument())
    userEvent.click(screen.getByTestId('add-prerequisites-button'))

    await waitFor(() => expect(screen.getByTestId('flag-prerequisite-modal')).toBeInTheDocument())

    expect(screen.getByTestId('flag-prerequisite-modal')).toMatchSnapshot()
  })
})
