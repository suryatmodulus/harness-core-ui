/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { get, merge } from 'lodash-es'
import { Spinner, Tabs } from '@blueprintjs/core'
import { Layout, Button, PageError } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { ExecutionNode } from 'services/pipeline-ng'
import { useGetApprovalInstance, ResponseApprovalInstanceResponse } from 'services/pipeline-ng'
import { isExecutionWaiting } from '@pipeline/utils/statusHelpers'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { PipelineDetailsTab } from '@pipeline/components/execution/StepDetails/tabs/PipelineDetailsTab/PipelineDetailsTab'
import { InputOutputTab } from '@pipeline/components/execution/StepDetails/tabs/InputOutputTab/InputOutputTab'

import {
  JiraApprovalTab,
  ApprovalData
} from '@pipeline/components/execution/StepDetails/tabs/JiraApprovalTab/JiraApprovalTab'
import { NoApprovalInstance } from '../NoApprovalInstanceCreated'
import tabCss from '../DefaultView/DefaultView.module.scss'

export const REFRESH_APPROVAL = 'REFRESH_APPROVAL'

export interface JiraApprovalViewProps extends StepDetailProps {
  step: ExecutionNode
  mock?: {
    data?: ResponseApprovalInstanceResponse
    loading?: boolean
  }
}

export function JiraApprovalView(props: JiraApprovalViewProps): React.ReactElement | null {
  const { step, mock } = props
  const approvalInstanceId = get(step, 'executableResponses[0].async.callbackIds[0]') || ''
  const isWaiting = isExecutionWaiting(step.status)
  const { getString } = useStrings()
  const {
    data,
    loading: loadingApprovalData,
    error,
    refetch
  } = useGetApprovalInstance({
    approvalInstanceId,
    mock,
    lazy: true
  })

  useEffect(() => {
    if (approvalInstanceId) {
      refetch()
    }
  }, [approvalInstanceId])

  if (error) {
    return (
      <Layout.Vertical height="100%">
        <PageError message={(error.data as Error)?.message || error.message} />
      </Layout.Vertical>
    )
  }

  if (loadingApprovalData) {
    return (
      <Layout.Vertical height="100%" flex={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </Layout.Vertical>
    )
  }

  return (
    <Tabs id="step-details" className={tabCss.tabs} renderActiveTabPanelOnly>
      <Tabs.Tab
        id="Approval"
        title={getString('approvalStage.title')}
        panel={
          approvalInstanceId ? (
            <JiraApprovalTab approvalData={data?.data as ApprovalData} isWaiting={isWaiting} />
          ) : (
            <NoApprovalInstance />
          )
        }
      />
      <Tabs.Tab id="PipelineDetails" title={getString('common.pipelineDetails')} panel={<PipelineDetailsTab />} />
      <Tabs.Tab
        id="Input"
        title={getString('common.input')}
        panel={<InputOutputTab baseFqn={step.baseFqn} mode="input" data={step.stepParameters} />}
      />
      <Tabs.Tab
        id="Output"
        title={getString('outputLabel')}
        panel={
          <InputOutputTab
            baseFqn={step.baseFqn}
            mode="output"
            data={Array.isArray(step.outcomes) ? { output: merge({}, ...step.outcomes) } : step.outcomes}
          />
        }
      />
      <Tabs.Expander />
      <Button
        minimal
        intent="primary"
        icon="refresh"
        iconProps={{ size: 12, style: { marginRight: 'var(--spacing-2)' } }}
        style={{ transform: 'translateY(-5px)' }}
        onClick={() => refetch()}
      >
        {getString('common.refresh')}
      </Button>
    </Tabs>
  )
}
