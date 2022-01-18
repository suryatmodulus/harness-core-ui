/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServiceMock from 'services/cf'

import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import { FlagsUseSegment } from '../FlagsUseSegment'

import mockSegmentFlag from './mockSegmentFlag'

jest.mock('services/cf')

jest.mock('@cf/hooks/useEnvironmentSelectV2', () => ({
  useEnvironmentSelectV2: jest.fn().mockReturnValue({ data: [], loading: false })
}))

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagsUseSegment gitSync={mockGitSync} />
    </TestWrapper>
  )
}

describe('FlagUseSegment', () => {
  test('it should render correctly', async () => {
    const patchMock = jest.fn()
    jest.spyOn(cfServiceMock, 'useGetAllFeatures').mockReturnValue({
      refetch: jest.fn(),
      data: { features: [mockFeature] },
      loading: false,
      mutate: patchMock
    } as any)
    jest.spyOn(cfServiceMock, 'usePatchFeature').mockReturnValue({ loading: false, mutate: patchMock } as any)
    jest.spyOn(cfServiceMock, 'useGetSegmentFlags').mockReturnValue({
      loading: false,
      data: mockSegmentFlag
    } as any)

    const { container } = renderComponent()

    expect(container).toMatchSnapshot()

    const addToFlagButton = screen.getByTestId('add-feature-flags-button')

    expect(addToFlagButton).toBeInTheDocument()

    userEvent.click(addToFlagButton)

    await waitFor(() => expect(screen.getByTestId('add-target-to-flag-modal')).toBeInTheDocument())
  })
})
