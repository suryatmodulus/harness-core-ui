/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DeploymentTimeDuration from './DeploymentTimeDuration'

describe('Test DeploymentTimeDuration', () => {
  test('should render', async () => {
    const endTime = 1634108599063
    const threeHoursAgo = endTime - 3 * 60 * 60 * 1000
    const { findByText } = render(
      <TestWrapper>
        <DeploymentTimeDuration startTime={threeHoursAgo} endTime={endTime} />
      </TestWrapper>
    )

    await waitFor(() => expect(findByText('3h')).toBeTruthy())
    await waitFor(() => expect(findByText('10/13/2021 07:03 am')).toBeTruthy())
    await waitFor(() => expect(findByText('common.durationPrefix')).toBeTruthy())
    await waitFor(() => expect(findByText('cv.changeSource.changeSourceCard.finished ')).toBeTruthy())
  })
})
