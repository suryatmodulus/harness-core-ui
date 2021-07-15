import React from 'react'
import type { FormikValues } from 'formik'
import { Color, Icon, Layout, Text, ThumbnailSelect } from '@wings-software/uicore'
import type { Item } from '@wings-software/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import { useStrings } from 'framework/strings'
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
export const ApprovalTypeCards = ({ formikProps, isReadonly }: { formikProps: FormikValues; isReadonly?: boolean }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <ThumbnailSelect
        name="approvalType"
        items={approvalTypeCardsData}
        className={css.approvalTypesThumbnail}
        isReadonly={isReadonly}
      />
      {formikProps.values.approvalType === StepType.HarnessApproval ? (
        <Layout.Horizontal
          spacing="small"
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
          margin={{ top: 'small', bottom: 'small' }}
        >
          <Icon name="info" size={12} margin={{ top: 'xsmall' }} />
          <Text lineClamp={2} width={300} color={Color.GREY_400}>
            {getString('pipeline.approvalStep.ensureUserGroups')}{' '}
            <a
              href="https://ngdocs.harness.io/article/fkvso46bok-adding-harness-approval-stages"
              rel="noreferrer"
              target="_blank"
            >
              {getString('learnMore')}
            </a>
          </Text>
        </Layout.Horizontal>
      ) : null}
    </Layout.Vertical>
  )
}
