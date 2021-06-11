import React from 'react'
import type { FormikValues } from 'formik'
import { Card, CardSelect, CardSelectType, Color, Icon, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ApprovalCardsViewData } from './types'
import css from './ApprovalStageMinimalMode.module.scss'

export const approvalTypeCardsData: ApprovalCardsViewData[] = [
  {
    text: 'Harness Approval',
    value: StepType.HarnessApproval,
    icon: 'nav-harness'
  },
  {
    text: 'Jira',
    value: StepType.JiraApproval,
    icon: 'service-jira'
  },
  {
    text: 'ServiceNow',
    value: 'SERVICENOW_APPROVAL',
    icon: 'service-servicenow',
    disabled: true
  },
  {
    text: 'Custom',
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
      <CardSelect
        data={approvalTypeCardsData}
        type={CardSelectType.Any}
        className={css.grid}
        renderItem={(item, selected) => (
          <div
            key={item.text}
            className={css.squareCardContainer}
            onClick={e => {
              if (item.disabled || isReadonly) {
                e.stopPropagation()
              }
            }}
          >
            <Card
              selected={selected}
              cornerSelected={selected}
              interactive={!(item.disabled && isReadonly)}
              disabled={item.disabled || isReadonly}
              className={css.squareCard}
            >
              <Icon name={item.icon} size={26} height={26} />
            </Card>
            <Text
              font={{ size: 'small', weight: selected ? 'semi-bold' : undefined, align: 'center' }}
              color={selected ? Color.BLACK_100 : Color.GREY_600}
            >
              {item.text}
            </Text>
          </div>
        )}
        selected={approvalTypeCardsData.find(
          (type: ApprovalCardsViewData) => type.value === formikProps.values.approvalType
        )}
        onChange={(value: ApprovalCardsViewData) => formikProps.setFieldValue('approvalType', value.value)}
      />
      {formikProps.values.approvalType === StepType.HarnessApproval ? (
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-start' }}>
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
