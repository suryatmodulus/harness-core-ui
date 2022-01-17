/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import { ExecutionVerificationView } from '../ExecutionVerificationView'
import { getActivityId, getDefaultTabId } from '../ExecutionVerificationView.utils'

jest.mock('../components/DeploymentMetrics/DeploymentMetrics', () => ({
  ...(jest.requireActual('../components/DeploymentMetrics/DeploymentMetrics') as any),
  DeploymentMetrics: () => <div className="deploymentMetrics" />
}))

jest.mock('../components/ExecutionVerificationSummary/ExecutionVerificationSummary', () => ({
  ExecutionVerificationSummary: () => <div className="summary" />
}))

jest.mock('../components/LogAnalysisContainer/LogAnalysisView.container', () => ({
  __esModule: true,
  default: () => <div className="LogAnalysisContainer" />
}))

jest.mock('highcharts-react-official', () => () => <></>)

describe('Unit tests for ExecutionVerificationView unit tests', () => {
  test('Ensure tabs are rendered', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationView step={{ progressData: { activityId: '1234_activityId' as any } }} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="bp3-tabs"]')).not.toBeNull())
    expect(getByText('pipeline.verification.analysisTab.logs')).not.toBeNull()
    expect(getByText('pipeline.verification.analysisTab.metrics')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })
  test('Ensure no analysis state is rendered when activity id does not exist', async () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationView step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="noAnalysis"]')))
    expect(container.querySelector('[class*="bp3-tabs"]')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('Ensure correct activityId is returned when getActivityId utils method is called with activityId being present in progressdata and not in outputdata', async () => {
    const step = {
      progressData: {
        activityId: 'activityId-from-step-progressData'
      }
    }
    expect(getActivityId(step as unknown as ExecutionNode)).toEqual('activityId-from-step-progressData')
  })

  test('Ensure correct activityId is returned when getActivityId utils method is called with activityId is not present in progressdata but present in output data', async () => {
    const step = {
      outcomes: {
        output: {
          activityId: 'activityId-from-step-outputdata'
        }
      }
    }
    expect(getActivityId(step as unknown as ExecutionNode)).toEqual('activityId-from-step-outputdata')
  })

  test('Ensure correct tabId is returned  ', () => {
    jest.mock('framework/strings', () => ({
      useStrings: () => ({
        getString: (val: string) => val
      })
    }))
    expect(getDefaultTabId((item: string) => item, undefined)).toEqual('pipeline.verification.analysisTab.metrics')
    expect(getDefaultTabId((item: string) => item, 'pipeline.verification.analysisTab.logs')).toEqual(
      'pipeline.verification.analysisTab.logs'
    )
    expect(getDefaultTabId((item: string) => item, 'pipeline.verification.analysisTab.metrics')).toEqual(
      'pipeline.verification.analysisTab.metrics'
    )
  })

  test('Ensure correct tabs are rendered via queryParams', async () => {
    const LogsContainer = render(
      <TestWrapper queryParams={{ type: 'pipeline.verification.analysisTab.logs' }}>
        <ExecutionVerificationView step={{ progressData: { activityId: '1234_activityId' as any } }} />
      </TestWrapper>
    )
    expect(LogsContainer.container.querySelector('.LogAnalysisContainer')).toBeInTheDocument()
    expect(LogsContainer.container.querySelector('.deploymentMetrics')).not.toBeInTheDocument()
    expect(LogsContainer.container).toMatchSnapshot()

    const MetricsContainer = render(
      <TestWrapper queryParams={{ type: 'pipeline.verification.analysisTab.metrics' }}>
        <ExecutionVerificationView step={{ progressData: { activityId: '1234_activityId' as any } }} />
      </TestWrapper>
    )
    expect(MetricsContainer.container.querySelector('.LogAnalysisContainer')).not.toBeInTheDocument()
    expect(MetricsContainer.container.querySelector('.deploymentMetrics')).toBeInTheDocument()
    expect(MetricsContainer.container).toMatchSnapshot()
  })
})
