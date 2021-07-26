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

      expect(getByText('pipeline.verification.logs.share')).not.toBeNull()
      expect(getByText('back')).not.toBeNull()
      expect(getByText('save')).not.toBeNull()
    })
  })
})
