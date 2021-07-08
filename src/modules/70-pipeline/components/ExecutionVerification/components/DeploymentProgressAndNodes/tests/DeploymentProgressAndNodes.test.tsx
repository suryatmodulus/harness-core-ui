import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Classes } from '@blueprintjs/core'
import type { DeploymentVerificationJobInstanceSummary } from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentProgressAndNodes, DeploymentProgressAndNodesProps } from '../DeploymentProgressAndNodes'

const BaselineDeploymentMockData: DeploymentProgressAndNodesProps = {
  deploymentSummary: {
    additionalInfo: {
      baselineDeploymentTag: null,
      baselineStartTime: 0,
      currentDeploymentTag: 'build#3',
      currentStartTime: 1602600600000,
      type: 'TEST'
    } as any,
    durationMs: 600000,
    environmentName: 'QA',
    jobName: 'loadtest',
    progressPercentage: 100,
    startTime: 1602600600000,
    status: 'SUCCESS' as DeploymentVerificationJobInstanceSummary['status'],
    verificationJobInstanceId: 'VS4Ck5okSMeGKiHDKls25w'
  }
}

const CanaryDeploymentMockData: DeploymentProgressAndNodesProps = {
  deploymentSummary: {
    additionalInfo: {
      canary: [
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-shkq6',
          risk: 'LOW',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-27znb',
          risk: 'LOW',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        }
      ],
      primary: [
        {
          hostName: 'manager-b6b7c4d9b-s228g',
          risk: 'NO_DATA',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-p2qlw',
          risk: 'HIGH',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-ghqpv',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-9sv75',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-czh8b',
          risk: 'NO_DATA',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-pg5wb',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-6bkpw',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-7cp2g',
          risk: 'HIGH',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-s6zzs',
          risk: 'HIGH',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-shkq6',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-c8gzk',
          risk: 'HIGH',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-27znb',
          risk: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        }
      ],
      trafficSplitPercentage: null,
      type: 'CANARY'
    } as any,
    durationMs: 600000,
    environmentName: 'prod',
    jobName: 'canary',
    progressPercentage: 58,
    startTime: 1602599760000,
    status: 'ERROR',
    verificationJobInstanceId: 'kuFEp5yRRDaGgK0i5fiGdg'
  }
}

describe('Deployment progress and nodes unit tests', () => {
  test('Ensure baseline info is rendered with green bar', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...BaselineDeploymentMockData} />
      </TestWrapper>
    )
    await waitFor(() => getByText('pipeline.verification.baselineTest'))

    expect(container.querySelector('[class*="bp3-intent-success"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 100%;')
  })
  test('Ensure production info for a canary deeployment is rendered with red bar', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentProgressAndNodes {...CanaryDeploymentMockData} />
      </TestWrapper>
    )
    await waitFor(() => getByText('canary'))
    expect(container.querySelector('[class*="bp3-intent-danger"]'))
    expect(container.querySelector(`.${Classes.PROGRESS_METER}`)?.getAttribute('style')).toEqual('width: 58%;')

    const deploymentNodes = container.querySelectorAll('[class*="boxWrap"]')
    expect(deploymentNodes.length).toBe(3)
    expect(deploymentNodes[0].querySelector('.box')?.children.length).toBe(12)
    expect(deploymentNodes[0].querySelector('.box')?.querySelectorAll('.highRiskColor').length).toBe(4)
    expect(deploymentNodes[0].querySelector('.box')?.querySelectorAll('.noAnalysisColor').length).toBe(6)
  })
})
