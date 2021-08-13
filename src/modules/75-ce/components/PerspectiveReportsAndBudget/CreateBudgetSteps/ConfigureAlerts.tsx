import React, { useMemo, useRef, useState } from 'react'
import { FieldArray, FieldArrayRenderProps, FormikProps } from 'formik'
import {
  Container,
  FormInput,
  StepProps,
  Layout,
  Heading,
  Text,
  Formik,
  Button,
  Icon,
  FormikForm,
  ModalErrorHandlerBinding,
  ModalErrorHandler
} from '@wings-software/uicore'
import { TagInput } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import { useCreateBudget, Budget, AlertThreshold, useUpdateBudget } from 'services/ce'
import css from '../PerspectiveCreateBudget.module.scss'

interface Props {
  name: string
  perspectiveName: string
  viewId: string
  accountId: string
  onSuccess: () => void
  budget?: Budget
  isEditMode: boolean
}

interface ThresholdForm {
  alertThresholds: AlertThreshold[]
}

const makeNewThresold = (): AlertThreshold => {
  return {
    percentage: undefined,
    basedOn: 'ACTUAL_COST',
    userGroupIds: [],
    emailAddresses: []
  }
}

const ConfigureAlerts: React.FC<StepProps<Budget> & Props> = props => {
  const { getString } = useStrings()
  const [loading, setLoading] = useState(false)
  const [hasError, setError] = useState(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { prevStepData, previousStep, viewId, perspectiveName, accountId, budget, isEditMode } = props
  const { type, budgetAmount = 0 } = (prevStepData || {}) as Budget

  const { mutate: updateBudget } = useUpdateBudget({ id: budget?.uuid || '' })
  const { mutate: createBudget } = useCreateBudget({
    queryParams: { accountIdentifier: accountId }
  })

  const getInitialValues = () => {
    return { alertThresholds: budget?.alertThresholds || [makeNewThresold()] }
  }

  const handleSubmit = async ({ alertThresholds }: ThresholdForm) => {
    setError(false)
    setLoading(true)

    const emptyThresholds = (t: AlertThreshold) => (t.emailAddresses?.length || 0) > 0 && t.percentage
    const payload = {
      name: perspectiveName,
      alertThresholds: alertThresholds.filter(emptyThresholds),
      type,
      budgetAmount: +budgetAmount,
      scope: {
        viewName: perspectiveName,
        type: 'PERSPECTIVE',
        viewId
      }
    }

    try {
      await (isEditMode ? updateBudget(payload as Budget) : createBudget(payload as Budget))
      props.onSuccess()
    } catch (e) {
      setError(true)
      setLoading(false)
      modalErrorHandler?.showDanger(e.message)
    }
  }

  return (
    <Layout.Vertical className={css.stepContainer} spacing="xxlarge">
      <Heading level={2} color="grey800" font={{ size: 'medium', weight: 'semi-bold' }}>
        {getString('ce.perspectives.budgets.configureAlerts.title')}
      </Heading>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Text>{getString('ce.perspectives.budgets.configureAlerts.subTitle')}</Text>
      <Container>
        <Text inline color="grey800" margin={{ right: 'small' }}>
          {getString('ce.perspectives.budgets.configureAlerts.budgetAmount')}
        </Text>
        <Text inline color="grey800" font={{ weight: 'bold', size: 'medium' }}>
          {formatCost(+budgetAmount)}
        </Text>
      </Container>
      <Container>
        <Formik<ThresholdForm>
          formName="alertThresholds"
          initialValues={getInitialValues()}
          onSubmit={data => {
            handleSubmit(data)
          }}
        >
          {formikProps => {
            return (
              <FormikForm>
                <Thresholds formikProps={formikProps} hasError={hasError} />
                <Layout.Horizontal spacing="medium">
                  <Button
                    text={getString('previous')}
                    icon="chevron-left"
                    onClick={() => previousStep?.(prevStepData)}
                  />
                  <Button
                    intent="primary"
                    rightIcon={'chevron-right'}
                    disabled={loading}
                    onClick={() => {
                      setTimeout(() => {
                        formikProps.submitForm()
                      }, 0)
                    }}
                  >
                    {getString('save')}
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

interface ThresholdsProps {
  formikProps: FormikProps<ThresholdForm>
  hasError: boolean
}

const Thresholds = (props: ThresholdsProps): JSX.Element => {
  const { formikProps } = props
  const { alertThresholds: alerts } = formikProps.values
  const endRef = useRef<HTMLDivElement>(null)
  const { getString } = useStrings()

  const renderLabels = () => {
    return (
      <div className={css.thresholdLabel}>
        <Text className={css.label}>{getString('ce.perspectives.budgets.configureAlerts.basedOn')}</Text>
        <Text color="grey0">{getString('ce.perspectives.budgets.configureAlerts.exceeds')}</Text>
        <Text className={css.label}>{getString('ce.perspectives.budgets.configureAlerts.percent')}</Text>
        <Text className={css.label}>{getString('ce.perspectives.reports.recipientLabel')}</Text>
      </div>
    )
  }

  const renderThresholds = (arrayHelpers: FieldArrayRenderProps) => {
    return alerts.map((at, idx) => {
      return (
        <Threshold
          key={idx}
          index={idx}
          value={at}
          handleEmailChange={values => {
            formikProps.setFieldValue(`alertThresholds.${idx}.emailAddresses`, values)
          }}
          onDelete={() => {
            if (alerts.length > 1) {
              arrayHelpers.remove(idx)
            }
          }}
        />
      )
    })
  }

  const renderAddThresholdButton = (arrayHelpers: FieldArrayRenderProps) => {
    return (
      <Container margin="medium">
        <Button
          withoutBoxShadow={true}
          className={css.addNewAlertBtn}
          text={getString('ce.perspectives.budgets.configureAlerts.createAlert')}
          onClick={() => {
            arrayHelpers.push(makeNewThresold())
            const timer = setTimeout(() => {
              endRef.current?.scrollIntoView({ behavior: 'smooth' })
              clearTimeout(timer)
            }, 0)
          }}
        />
      </Container>
    )
  }

  return (
    <FieldArray
      name="alertThresholds"
      render={arrayHelpers => {
        return (
          <Container style={{ minHeight: props.hasError ? 275 : 350 }}>
            <div className={css.thresholds}>
              {renderLabels()}
              <div className={css.threshCtn}>
                {renderThresholds(arrayHelpers)}
                <div ref={endRef} />
              </div>
              {renderAddThresholdButton(arrayHelpers)}
            </div>
          </Container>
        )
      }}
    />
  )
}

interface ThresholdProps {
  handleEmailChange: (value: React.ReactNode) => void
  value: AlertThreshold
  onDelete: () => void
  index: number
}

const Threshold = (props: ThresholdProps): JSX.Element => {
  const { value, index: idx, onDelete, handleEmailChange } = props
  const { getString } = useStrings()
  const BASED_ON_OPTIONS = useMemo(() => {
    return [
      {
        label: getString('ce.perspectives.budgets.configureAlerts.actual'),
        value: 'ACTUAL_COST'
      },
      {
        label: getString('ce.perspectives.budgets.configureAlerts.forecasted'),
        value: 'FORECASTED_COST'
      }
    ]
  }, [])

  return (
    <div className={css.threshold}>
      <FormInput.Select
        value={BASED_ON_OPTIONS.find(op => op.value === value.basedOn)}
        items={BASED_ON_OPTIONS}
        name={`alertThresholds.${idx}.basedOn`}
      />
      <Text className={css.pushdown7}>exceeds</Text>
      <FormInput.Text name={`alertThresholds.${idx}.percentage`} />
      <TagInput
        addOnBlur
        className={css.tagInput}
        tagProps={{ className: css.tag }}
        placeholder={getString('ce.perspectives.reports.emailPlaceholder')}
        onChange={values => handleEmailChange(values)}
        // onAdd={values => {}}
        values={value.emailAddresses || []}
      />
      <Icon
        color="grey200"
        size={18}
        name="ban-circle"
        className={css.pushdown7}
        onClick={onDelete}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )
}

export default ConfigureAlerts
