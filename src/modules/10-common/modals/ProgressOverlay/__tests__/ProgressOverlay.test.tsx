import React from 'react'
import { render, getByText } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { ProgressOverlay, Stage } from '../ProgressOverlay'

describe('Test ProgressOverlay overlay component', () => {
  test('Should show correct stage labels and icons', () => {
    const pushingChangesToGitStage = {
      status: 'SUCCESS',
      intermediateLabel: 'Pushing changes to Git',
      finalLabel: 'Pushed changes to Git'
    } as Stage

    const createConnectorStage = {
      status: 'IN_PROGRESS',
      intermediateLabel: 'Creating connector',
      finalLabel: 'Connector successfully created'
    } as Stage

    const initialProps = {
      firstStage: pushingChangesToGitStage,
      secondStage: createConnectorStage,
      onClose: jest.fn
    }

    const { container, rerender } = render(
      <TestWrapper>
        <ProgressOverlay {...initialProps} />
      </TestWrapper>
    )

    /* initial view */

    // should show overall progress
    expect(getByText(container, 'common.gitSync.savingInProgress')).toBeTruthy()
    // should show first stage label
    expect(getByText(container, pushingChangesToGitStage.intermediateLabel)).toBeTruthy()
    // should show second stage label
    expect(getByText(container, createConnectorStage.intermediateLabel)).toBeTruthy()

    /* finish to completion */

    pushingChangesToGitStage['finalLabel'] = 'Unable to push changes to Git'
    pushingChangesToGitStage['status'] = 'FAILURE'
    rerender(<ProgressOverlay {...initialProps} />)
    // should show overall progress
    expect(getByText(container, pushingChangesToGitStage.finalLabel)).toBeTruthy()
  })
})
