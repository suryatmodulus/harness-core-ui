/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Text, Color, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'
import { cronSensicalMinutesOptions, getUpdatedExpression, getSlashValue } from './ScheduleUtils'
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
      <Text className={css.label}>{getString('pipeline.triggers.schedulePanel.runEvery')}</Text>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
        <FormInput.Select
          name="minutes"
          items={cronSensicalMinutesOptions}
          placeholder="Select"
          onChange={option => {
            formikProps.setValues({
              ...values,
              minutes: option.value,
              expression: getUpdatedExpression({
                expression,
                value: getSlashValue({ selectedScheduleTab, id: 'minutes', value: option.value as string }),
                id: 'minutes'
              })
            })
          }}
        />
        <Text style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.GREY_800}>
          {getString('pipeline.triggers.schedulePanel.minutesParentheses')}
        </Text>
      </Layout.Horizontal>
      <Spacer paddingTop="var(--spacing-xsmall)" />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  )
}
