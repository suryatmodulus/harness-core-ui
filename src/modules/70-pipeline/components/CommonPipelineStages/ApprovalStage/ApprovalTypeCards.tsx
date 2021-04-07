import React from 'react'
import type { FormikValues } from 'formik'
import { Card, CardSelect, CardSelectType, Color, Icon, Text } from '@wings-software/uicore'
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
export const ApprovalTypeCards = ({ formikProps }: FormikValues) => {
  return (
    <CardSelect
      data={approvalTypeCardsData}
      type={CardSelectType.Any}
      className={css.grid}
      renderItem={(item, selected) => (
        <div
          key={item.text}
          className={css.squareCardContainer}
          onClick={e => {
            if (item.disabled) {
              e.stopPropagation()
            }
          }}
        >
          <Card
            selected={selected}
            cornerSelected={selected}
            interactive={!item.disabled}
            disabled={item.disabled}
            className={css.squareCard}
          >
            <Icon name={item.icon} size={26} height={26} />
          </Card>
          <Text
            style={{
              fontSize: '12px',
              color: selected ? Color.GREY_900 : Color.GREY_350,
              textAlign: 'center'
            }}
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
  )
}
