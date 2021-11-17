import React from 'react'
import type { FormikValues } from 'formik'
import { Layout } from '@wings-software/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { RbacThumbnailItem, RbacThumbnailSelect } from '@rbac/components/RbacThumbnailSelect/RbacThumbnailSelect'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import css from './ApprovalStageMinimalMode.module.scss'

export const approvalTypeCardsData: RbacThumbnailItem[] = [
  {
    label: 'Harness Approval',
    value: StepType.HarnessApproval,
    icon: 'nav-harness'
  },
  {
    label: 'Jira',
    value: StepType.JiraApproval,
    icon: 'service-jira',
    featureProps: {
      featureRequest: {
        featureName: FeatureIdentifier.INTEGRATED_APPROVALS_WITH_JIRA
      }
    }
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
      <RbacThumbnailSelect
        name="approvalType"
        items={approvalTypeCardsData}
        className={css.approvalTypesThumbnail}
        isReadonly={isReadonly}
      />
    </Layout.Vertical>
  )
}
