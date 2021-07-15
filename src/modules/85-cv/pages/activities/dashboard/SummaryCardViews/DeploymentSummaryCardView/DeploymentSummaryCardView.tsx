import React from 'react'
import { Button, Color, Container, Icon, Text } from '@wings-software/uicore'
import {
  DeploymentProgressAndNodes,
  DeploymentProgressAndNodesProps
} from '@pipeline/components/ExecutionVerification/components/DeploymentProgressAndNodes/DeploymentProgressAndNodes'
import type { Activity } from '../../ActivityTimeline/ActivityTrack/ActivityTrackUtils'
import { ACTIVITY_SELECTION_EVENT } from '../../ActivityTimeline/ActivityTrack/ActivityTrackUtils'
import css from './DeploymentSummaryCardView.module.scss'

export interface DeploymentSummaryCardViewProps {
  selectedActivity: Activity
  onClose: () => void
}

const DeploymentMockData: DeploymentProgressAndNodesProps = {
  deploymentSummary: {
    additionalInfo: {
      canary: [
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-shkq6',
          riskScore: 'LOW_RISK',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-27znb',
          riskScore: 'LOW_RISK',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        }
      ],
      primary: [
        {
          hostName: 'manager-b6b7c4d9b-s228g',
          riskScore: 'NO_DATA',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-p2qlw',
          riskScore: 'HIGH_RISK',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-ghqpv',
          riskScore: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-9sv75',
          riskScore: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-czh8b',
          riskScore: 'NO_DATA',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-pg5wb',
          riskScore: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-58d9c944df-6bkpw',
          riskScore: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-7cp2g',
          riskScore: 'HIGH_RISK',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-s6zzs',
          riskScore: 'HIGH_RISK',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-shkq6',
          riskScore: null,
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'manager-b6b7c4d9b-c8gzk',
          riskScore: 'HIGH_RISK',
          anomalousMetricsCount: 0,
          anomalousLogClustersCount: 0
        },
        {
          hostName: 'harness-test-appd-deployment-68977b7dbf-27znb',
          riskScore: null,
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
  // instancePhase: InstancePhase.PRODUCTION
}

export function DeploymentSummaryCardView(props: DeploymentSummaryCardViewProps): JSX.Element {
  const { selectedActivity, onClose } = props
  return (
    <Container className={css.main}>
      <Container className={css.header}>
        <Icon name="cd-main" size={28} className={css.activityTypeIcon} />
        <Text color={Color.BLACK} font={{ size: 'medium' }} className={css.activityName}>
          {selectedActivity.activityName}
        </Text>
        <Button
          icon="main-close"
          iconProps={{ size: 12 }}
          minimal
          onClick={() => {
            document.dispatchEvent(
              new CustomEvent(ACTIVITY_SELECTION_EVENT, {
                bubbles: true,
                detail: undefined
              })
            )
            onClose()
          }}
        />
      </Container>
      <DeploymentProgressAndNodes className={css.progressCard} {...DeploymentMockData} />
    </Container>
  )
}
