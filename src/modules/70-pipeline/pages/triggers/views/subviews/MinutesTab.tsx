import React from 'react'
import { FormInput, Text, Color, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'
import { oneFiftyNineOptions, getUpdatedExpression, getBackslashValue } from './ScheduleUtils'
import css from './MinutesTab.module.scss'

interface MinutesTabInterface {
  formikProps: any
}

export default function MinutesTab(props: MinutesTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { expression, selectedScheduleTab },
      values
    },
    formikProps
  } = props
  const { getString } = useStrings()

  return (
    <div className={css.minutesTab}>
      <Text className={css.label}>{getString('pipeline-triggers.schedulePanel.runEvery')}</Text>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
        <FormInput.Select
          name="minutes"
          items={oneFiftyNineOptions}
          placeholder="Select"
          onChange={val => {
            formikProps.setFieldValue(
              'expression',
              getUpdatedExpression({
                expression,
                value: getBackslashValue({ selectedScheduleTab, id: 'minutes', value: val.value as string }),
                id: 'minutes'
              })
            )
          }}
        />
        <Text style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.GREY_800}>
          {getString('pipeline-triggers.schedulePanel.minutesParentheses')}
        </Text>
      </Layout.Horizontal>
      <Spacer paddingTop="var(--spacing-xsmall)" />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  )
}
