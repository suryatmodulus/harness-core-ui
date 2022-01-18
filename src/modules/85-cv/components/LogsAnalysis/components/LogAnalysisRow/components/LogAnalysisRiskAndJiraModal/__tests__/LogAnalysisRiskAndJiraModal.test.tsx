/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { LogAnalysisRiskAndJiraModal } from '../LogAnalysisRiskAndJiraModal'
import type { LogAnalysisRiskAndJiraModalProps } from '../LogAnalysisRiskAndJiraModal.types'

const WrapperComponent = (props: LogAnalysisRiskAndJiraModalProps): JSX.Element => {
  return (
    <TestWrapper>
      <LogAnalysisRiskAndJiraModal {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for LogAnalysisRiskAndJiraModal', () => {
  const initialProps = {
    count: 10,
    activityType: 'Known events',
    onHide: jest.fn(),
    logMessage: 'Exception-1'
  }
  test('Verify if all the fields are rendered correctly inside LogAnalysisRiskAndJiraModal', async () => {
    const { getByText } = render(<WrapperComponent {...initialProps} />)

    await waitFor(() => {
      // Verify if trendline is rendered
      expect(getByText('instanceFieldOptions.instanceHolder')).not.toBeNull()
      expect(getByText('pipeline.verification.logs.trend')).not.toBeNull()

      // Verify if correct count is rendered
      expect(getByText(initialProps.count.toString())).not.toBeNull()

      // Verify if correct sample event type is rendered
      expect(getByText('pipeline.verification.logs.sampleEvent')).not.toBeNull()
      expect(getByText(initialProps.activityType)).not.toBeNull()

      expect(getByText('back')).not.toBeNull()
    })
  })
})
