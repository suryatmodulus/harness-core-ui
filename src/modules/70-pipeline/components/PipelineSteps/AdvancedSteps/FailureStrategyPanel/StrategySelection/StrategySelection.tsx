import React from 'react'
import { FormGroup, Intent } from '@blueprintjs/core'
import { connect, FormikContext, FieldArray } from 'formik'
import { get, difference } from 'lodash-es'
import { MultiTextInput, Button, MultiTypeInputType } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import cx from 'classnames'

import { errorCheck } from '@common/utils/formikHelpers'
import { useStrings } from 'framework/exports'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { Strategy } from './StrategyConfig'
import { StrategyIcon } from './StrategyIcon'
import css from './StrategySelection.module.scss'

/**
 * NOTE: Failure strategies do not support runtime inputs
 */

export interface BaseStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikContext<any>
  name: string
  specPath: string
  parentStrategy?: Strategy
  allowedStrategies: Strategy[]
}

export function ManualInterventionStep(props: BaseStepProps): React.ReactElement {
  const { name, formik, parentStrategy, allowedStrategies, specPath } = props

  function handleChange(): void {
    formik.setFieldValue(name, undefined)
    formik.setFieldValue(specPath, undefined)
  }

  const { getString } = useStrings()

  return (
    <div className={css.step}>
      <StrategyIcon strategy={Strategy.ManualIntervention} checked onChange={handleChange} />
      <FormMultiTypeDurationField
        name={`${specPath}.timeout`}
        label="Timeout"
        multiTypeDurationProps={{
          enableConfigureOptions: false,
          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
        }}
      />
      <StrategySelection
        label={getString('pipeline.failureStrategies.fieldLabels.onTimeoutLabel')}
        name={`${specPath}.onTimeout.action`}
        formik={formik}
        parentStrategy={Strategy.ManualIntervention}
        allowedStrategies={difference(allowedStrategies, [
          Strategy.ManualIntervention,
          parentStrategy || Strategy.ManualIntervention
        ])}
      />
    </div>
  )
}

export function RetryStep(props: BaseStepProps): React.ReactElement {
  const { name, formik, parentStrategy, allowedStrategies, specPath } = props
  const { getString } = useStrings()
  const uids = React.useRef<string[]>([])
  const retryIntervalsFieldName = `${specPath}.retryIntervals`
  const retryCountFieldName = `${specPath}.retryCount`

  function handleChange(): void {
    formik.setFieldValue(name, undefined)
    formik.setFieldValue(specPath, undefined)
  }

  const intervals: string[] = get(formik.values, retryIntervalsFieldName) || []
  const retryCountHasError = errorCheck(retryCountFieldName, formik)
  const intent = retryCountHasError ? Intent.DANGER : Intent.NONE
  const helperText = retryCountHasError ? get(formik?.errors, retryCountFieldName) : null
  const retryCountValue = get(formik?.values, retryCountFieldName, '')

  /**
   * We are using `MultiTextInput` here because we want to
   * parse the value to an integer (whenever possible)
   *
   * It is not possible when using `FormInput.MultiTextInput`
   */
  return (
    <div className={cx(css.step, css.retryStep)}>
      <StrategyIcon strategy={Strategy.Retry} checked onChange={handleChange} />
      <FormGroup
        label={getString('pipeline.failureStrategies.fieldLabels.retryCountLabel')}
        labelFor={retryCountFieldName}
        helperText={helperText}
        intent={intent}
      >
        <MultiTextInput
          textProps={{
            type: 'number',
            min: 0,
            name: retryCountFieldName
          }}
          name={retryCountFieldName}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
          value={retryCountValue}
          onChange={newValue => {
            const parsedValue = parseInt(newValue as string)

            formik.setFieldValue(retryCountFieldName, Number.isNaN(parsedValue) ? newValue : parsedValue)
            formik.setFieldTouched(retryCountFieldName, true)
          }}
        />
      </FormGroup>
      <MultiTypeFieldSelector
        name={retryIntervalsFieldName}
        label={getString('pipeline.failureStrategies.fieldLabels.retryIntervalsLabel')}
        defaultValueToReset={['1d']}
        disableTypeSelection
      >
        <FieldArray name={retryIntervalsFieldName}>
          {({ push, remove }) => {
            function handleAdd(): void {
              uids.current.push(uuid())
              push('')
            }

            return (
              <div className={css.retryStepIntervals}>
                <div>
                  {intervals.map((_, i) => {
                    // generated uuid if they are not present
                    if (!uids.current[i]) {
                      uids.current[i] = uuid()
                    }

                    const key = uids.current[i]

                    function handleRemove(): void {
                      uids.current.splice(i, 1)
                      remove(i)
                    }

                    return (
                      <div className={css.row} key={key}>
                        <FormMultiTypeDurationField
                          name={`${retryIntervalsFieldName}[${i}]`}
                          label=""
                          multiTypeDurationProps={{
                            enableConfigureOptions: false,
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                            defaultValueToReset: ''
                          }}
                        />
                        <Button
                          minimal
                          small
                          icon="trash"
                          onClick={handleRemove}
                          data-testid={`remove-retry-interval-${i}`}
                        />
                      </div>
                    )
                  })}
                </div>
                <Button icon="plus" minimal intent="primary" data-testid="add-retry-interval" onClick={handleAdd}>
                  Add
                </Button>
              </div>
            )
          }}
        </FieldArray>
      </MultiTypeFieldSelector>
      <StrategySelection
        label={getString('pipeline.failureStrategies.fieldLabels.onRetryFailureLabel')}
        name={`${specPath}.onRetryFailure.action`}
        formik={formik}
        parentStrategy={Strategy.Retry}
        allowedStrategies={difference(allowedStrategies, [Strategy.Retry, parentStrategy || Strategy.Retry])}
      />
    </div>
  )
}

export function RollbackStageStep(props: BaseStepProps): React.ReactElement {
  function handleChange(): void {
    props.formik.setFieldValue(props.name, undefined)
    props.formik.setFieldTouched(props.name, true)
  }

  return (
    <div className={css.step}>
      <StrategyIcon strategy={Strategy.StageRollback} checked onChange={handleChange} />
    </div>
  )
}

export function RollbackStepGroupStep(props: BaseStepProps): React.ReactElement {
  function handleChange(): void {
    props.formik.setFieldValue(props.name, undefined)
    props.formik.setFieldTouched(props.name, true)
  }

  return (
    <div className={css.step}>
      <StrategyIcon strategy={Strategy.StepGroupRollback} checked onChange={handleChange} />
    </div>
  )
}

export function IgnoreFailureStep(props: BaseStepProps): React.ReactElement {
  function handleChange(): void {
    props.formik.setFieldValue(props.name, undefined)
  }

  return (
    <div className={css.step}>
      <StrategyIcon strategy={Strategy.Ignore} checked onChange={handleChange} />
    </div>
  )
}

export function MarkAsSuccessStep(props: BaseStepProps): React.ReactElement {
  function handleChange(): void {
    props.formik.setFieldValue(props.name, undefined)
    props.formik.setFieldTouched(props.name, true)
  }

  return (
    <div className={css.step}>
      <StrategyIcon strategy={Strategy.MarkAsSuccess} checked onChange={handleChange} />
    </div>
  )
}

export function AbortStep(props: BaseStepProps): React.ReactElement {
  function handleChange(): void {
    props.formik.setFieldValue(props.name, undefined)
    props.formik.setFieldTouched(props.name, true)
  }

  return (
    <div className={css.step}>
      <StrategyIcon strategy={Strategy.Abort} checked onChange={handleChange} />
    </div>
  )
}

export interface SelectedStepProps extends BaseStepProps {
  strategy: Strategy
}

export function SelectedStep(props: SelectedStepProps): React.ReactElement {
  const { strategy, ...rest } = props

  switch (strategy) {
    case Strategy.Abort:
      return <AbortStep {...rest} />
    case Strategy.ManualIntervention:
      return <ManualInterventionStep {...rest} />
    case Strategy.MarkAsSuccess:
      return <MarkAsSuccessStep {...rest} />
    case Strategy.Retry:
      return <RetryStep {...rest} />
    case Strategy.StageRollback:
      return <RollbackStageStep {...rest} />
    case Strategy.StepGroupRollback:
      return <RollbackStepGroupStep {...rest} />
    case Strategy.Ignore:
      return <IgnoreFailureStep {...rest} />
    default:
      return <div>&quot;{strategy}&quot; in not supported</div>
  }
}

export interface StrategySelectionProps {
  label: string
  name: string
  allowedStrategies: Strategy[]
  parentStrategy?: Strategy
}

export interface ConnectedStrategySelectionProps extends StrategySelectionProps {
  formik: FormikContext<{}>
}

export function StrategySelection(props: ConnectedStrategySelectionProps): React.ReactElement {
  const { name, label, formik, allowedStrategies, parentStrategy } = props

  const fieldName = `${name}.type`
  const value = get(formik.values, fieldName)
  const hasError = errorCheck(fieldName, formik)
  const intent = hasError ? Intent.DANGER : Intent.NONE
  const helperText = hasError ? get(formik?.errors, fieldName) : null

  return (
    <FormGroup label={label} labelFor={name} helperText={helperText} intent={intent}>
      {value ? (
        <SelectedStep
          strategy={value}
          name={fieldName}
          specPath={`${name}.spec`}
          formik={formik}
          parentStrategy={parentStrategy}
          allowedStrategies={allowedStrategies}
        />
      ) : (
        <StrategyStepsList allowedStrategies={allowedStrategies} name={fieldName} formik={formik} />
      )}
    </FormGroup>
  )
}

export interface StrategyStepsListProps {
  allowedStrategies: Strategy[]
  name: string
  formik: FormikContext<{}>
}

export function StrategyStepsList(props: StrategyStepsListProps): React.ReactElement {
  const { name, formik, allowedStrategies } = props

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    formik.setFieldValue(name, e.target.value as Strategy)
    formik.setFieldTouched(name, true)
  }

  return (
    <ul className={css.stepsList}>
      {allowedStrategies.map(strategy => {
        return (
          <li key={strategy}>
            <StrategyIcon strategy={strategy} onChange={handleChange} />
          </li>
        )
      })}
    </ul>
  )
}

export default connect<StrategySelectionProps>(StrategySelection)
