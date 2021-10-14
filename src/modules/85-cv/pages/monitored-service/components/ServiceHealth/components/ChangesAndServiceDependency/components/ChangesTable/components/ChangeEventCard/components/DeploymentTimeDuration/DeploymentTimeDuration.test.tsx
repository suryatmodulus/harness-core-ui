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
