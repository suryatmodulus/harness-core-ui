import React, { useEffect } from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import { getBreakdownValues } from './ScheduleUtils'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'

interface CustomTabInterface {
  formikProps: any
}

export default function CustomTab(props: CustomTabInterface): JSX.Element {
  const {
    formikProps: { values },
    formikProps
  } = props
  const { getString } = useStrings()

  useEffect(() => {
    formikProps.validateForm()
  }, [])

  return (
    <>
      <FormInput.Text
        label={getString('pipeline-triggers.schedulePanel.enterCustomCron')}
        name="expression"
        style={{ margin: 0 }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e?.target?.value) {
            const breakdownValues = getBreakdownValues(e.target.value)
            formikProps.setValues({ ...values, expression: e.target.value, breakdownValues })
          }
        }}
      />
      <Spacer paddingTop="4px" />
      <ExpressionBreakdown
        formikValues={values}
        activeInputs={[
          ActiveInputs.MINUTES,
          ActiveInputs.HOURS,
          ActiveInputs.DAY_OF_MONTH,
          ActiveInputs.MONTH,
          ActiveInputs.DAY_OF_WEEK
        ]}
      />
      <Spacer paddingTop="4px" />
      <Expression formikProps={formikProps} />
    </>
  )
}
