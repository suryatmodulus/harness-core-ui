import React from 'react'
import type { FormikValues } from 'formik'
import { Layout, ThumbnailSelect } from '@wings-software/uicore'
import type { Item } from '@wings-software/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import css from './ApprovalStageMinimalMode.module.scss'

export const approvalTypeCardsData: Item[] = [
  {
    label: 'Harness Approval',
    value: StepType.HarnessApproval,
    icon: 'nav-harness'
  },
  {
    label: 'Jira',
    value: StepType.JiraApproval,
    icon: 'service-jira'
  },
  {
    label: 'ServiceNow',
    value: 'SERVICENOW_APPROVAL',
    icon: 'service-servicenow',
    disabled: true
  },
  {
    label: 'Custom',
    value: 'CUSTOM_APPROVAL',
    icon: 'other-workload',
    disabled: true
  }
]

/*
The component to select approval type card in stage
Used in both minimal view as well as detailed view
*/
export const ApprovalTypeCards = ({ isReadonly }: { formikProps: FormikValues; isReadonly?: boolean }) => {
  return (
    <Layout.Vertical>
      <ThumbnailSelect
        name="approvalType"
        items={approvalTypeCardsData}
        className={css.approvalTypesThumbnail}
        isReadonly={isReadonly}
      />
    </Layout.Vertical>
  )
}
