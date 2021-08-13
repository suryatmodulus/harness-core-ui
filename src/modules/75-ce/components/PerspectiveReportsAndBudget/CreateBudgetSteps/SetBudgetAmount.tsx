import React, { useMemo } from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'
import {
  Text,
  Heading,
  Container,
  StepProps,
  Layout,
  Button,
  FormInput,
  Formik,
  FormikForm
} from '@wings-software/uicore'
import type { Budget } from 'services/ce'
import formatCost from '@ce/utils/formatCost'
import { useStrings } from 'framework/strings'
import css from '../PerspectiveCreateBudget.module.scss'

interface Props {
  name: string
  budget?: Budget
  isEditMode: boolean
}

interface Form {
  type: 'SPECIFIED_AMOUNT' | 'PREVIOUS_MONTH_SPEND'
  budgetAmount: number
}

const SetBudgetAmount: React.FC<StepProps<Budget> & Props> = props => {
  const { getString } = useStrings()
  const { nextStep, prevStepData, budget: { lastMonthCost = 0, forecastCost = 0, budgetAmount = 0, type } = {} } = props

  const BUDGET_TYPE = useMemo(() => {
    return [
      { label: getString('ce.perspectives.budgets.setBudgetAmount.specifiedAmount'), value: 'SPECIFIED_AMOUNT' },
      { label: getString('ce.perspectives.budgets.setBudgetAmount.lastMonthSpend'), value: 'PREVIOUS_MONTH_SPEND' }
    ]
  }, [])

  const COSTS = useMemo(
    () => [
      [getString('ce.perspectives.budgets.setBudgetAmount.lastMonthCost'), lastMonthCost],
      [getString('ce.perspectives.budgets.setBudgetAmount.projectedCost'), forecastCost]
    ],
    [lastMonthCost, forecastCost]
  )

  const handleSubmit = (data: Form) => {
    const nextStepData: Budget = {
      ...((prevStepData || {}) as Budget),
      type: data.type,
      budgetAmount: data.budgetAmount,
      lastMonthCost: lastMonthCost,
      forecastCost: forecastCost
    }

    nextStep?.(nextStepData)
  }

  const renderCosts = () => {
    return (
      <div className={css.costs}>
        {COSTS.map((cost, idx) => {
          return (
            <>
              <div key={idx}>
                <Text color="grey800" margin={{ bottom: 'small' }} font={{ size: 'small', weight: 'semi-bold' }}>
                  {cost[0]}
                </Text>
                <Text color="grey800" font={{ weight: 'bold', size: 'medium' }}>
                  {formatCost(cost[1] as number)}
                </Text>
              </div>
              {idx === 0 && <div className={css.separator}></div>}
            </>
          )
        })}
      </div>
    )
  }

  return (
    <Layout.Vertical className={css.stepContainer} spacing="xxlarge">
      <Heading level={2} color="grey800" font={{ size: 'medium', weight: 'semi-bold' }}>
        {getString('ce.perspectives.budgets.setBudgetAmount.title')}
      </Heading>
      {renderCosts()}
      <Container>
        <Formik<Form>
          onSubmit={data => {
            handleSubmit(data)
          }}
          formName="createReportScheduleForm"
          enableReinitialize={true}
          initialValues={{
            type: type || get(prevStepData, 'type') || 'SPECIFIED_AMOUNT',
            budgetAmount: budgetAmount || get(prevStepData, 'budgetAmount') || 0
          }}
        >
          {formikProps => {
            return (
              <FormikForm>
                <Container style={{ minHeight: 350 }}>
                  <Container className={cx(css.main, css.dataFields)}>
                    <Layout.Vertical spacing="small">
                      <FormInput.Select
                        value={BUDGET_TYPE.find(op => op.value === formikProps.values.type)}
                        items={BUDGET_TYPE}
                        name={'type'}
                        label={getString('ce.perspectives.budgets.setBudgetAmount.budgetType')}
                        onChange={option => {
                          if (option.value === 'PREVIOUS_MONTH_SPEND') {
                            formikProps.setFieldValue('budgetAmount', lastMonthCost || 0)
                          }
                        }}
                      />
                      <FormInput.Text
                        disabled={formikProps.values.type === 'PREVIOUS_MONTH_SPEND'}
                        name={'budgetAmount'}
                        label={
                          formikProps.values.type === 'PREVIOUS_MONTH_SPEND'
                            ? getString('ce.perspectives.budgets.setBudgetAmount.lastMonthSpend')
                            : getString('ce.perspectives.budgets.setBudgetAmount.specifyAmount')
                        }
                      />
                    </Layout.Vertical>
                  </Container>
                </Container>
                <Layout.Horizontal spacing="medium">
                  <Button type="submit" intent="primary" rightIcon={'chevron-right'} disabled={false}>
                    {getString('continue')}
                  </Button>
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

export default SetBudgetAmount
