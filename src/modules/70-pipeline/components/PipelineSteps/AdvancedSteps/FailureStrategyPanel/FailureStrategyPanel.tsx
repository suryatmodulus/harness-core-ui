import React from 'react'
import { Button } from '@wings-software/uicore'
import { FieldArray, FormikProps } from 'formik'
import { v4 as uuid } from 'uuid'
import { flatMap, get, isEmpty, uniq } from 'lodash-es'

import { String, useStrings } from 'framework/strings'
import type {
  RetryFailureActionConfig,
  IgnoreFailureActionConfig,
  ManualInterventionFailureActionConfig,
  AbortFailureActionConfig,
  StepGroupFailureActionConfig,
  MarkAsSuccessFailureActionConfig,
  StageRollbackFailureActionConfig,
  FailureStrategyConfig,
  OnFailureConfig
} from 'services/cd-ng'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'

import FailureTypeMultiSelect from './FailureTypeMultiSelect'
import { allowedStrategiesAsPerStep, errorTypesForStages } from './StrategySelection/StrategyConfig'
import StrategySelection from './StrategySelection/StrategySelection'
import css from './FailureStrategyPanel.module.scss'

export type AllActions =
  | RetryFailureActionConfig
  | IgnoreFailureActionConfig
  | ManualInterventionFailureActionConfig
  | AbortFailureActionConfig
  | StepGroupFailureActionConfig
  | MarkAsSuccessFailureActionConfig
  | StageRollbackFailureActionConfig

export interface AllFailureStrategyConfig extends FailureStrategyConfig {
  onFailure: OnFailureConfig & { action: AllActions }
}

/**
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/865403111/Failure+Strategy+-+CD+Next+Gen
 *
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1046806671/NG+Failure+Strategies+Backend
 */

export interface FailureStrategyPanelProps {
  formikProps: FormikProps<{
    failureStrategies?: AllFailureStrategyConfig[]
  }>
  mode: Modes
  isReadonly: boolean
  stageType?: StageType
}

export default function FailureStrategyPanel(props: FailureStrategyPanelProps): React.ReactElement {
  const {
    formikProps: { values: formValues, submitForm, errors, isSubmitting },
    mode,
    isReadonly,
    stageType = StageType.DEPLOY
  } = props
  const tabWithErrors =
    (Array.isArray(errors?.failureStrategies) && errors?.failureStrategies.findIndex(err => !isEmpty(err))) ||
    /* istanbul ignore next */ 0
  const [selectedStrategyNum, setSelectedStrategyNum] = React.useState(Math.max(tabWithErrors, 0))
  const hasFailureStrategies = Array.isArray(formValues.failureStrategies) && formValues.failureStrategies.length > 0

  const { getString } = useStrings()

  const uids = React.useRef<string[]>([])

  const isDefaultStageStrategy = mode === Modes.STAGE && stageType === StageType.DEPLOY && selectedStrategyNum === 0
  const filterTypes = uniq(
    flatMap(formValues.failureStrategies || /* istanbul ignore next */ [], e => e.onFailure?.errors || [])
  )

  const currentTabHasErrors = !isEmpty(get(errors, `failureStrategies[${selectedStrategyNum}]`))
  const addedAllStratgies = filterTypes.length === errorTypesForStages[stageType].length

  const isAddBtnDisabled = addedAllStratgies || isReadonly || currentTabHasErrors

  async function handleTabChange(n: number): Promise<void> {
    await submitForm()

    // only change tab if current tab has no errors
    /* istanbul ignore else */
    if (isEmpty(get(errors, `failureStrategies[${selectedStrategyNum}]`))) {
      setSelectedStrategyNum(n)
    }
  }

  React.useEffect(() => {
    /* istanbul ignore else */
    if (Array.isArray(formValues.failureStrategies) && selectedStrategyNum >= formValues.failureStrategies.length) {
      setSelectedStrategyNum(Math.max(0, formValues.failureStrategies.length - 1))
    }
  }, [formValues.failureStrategies, selectedStrategyNum])

  // open errored tab
  React.useEffect(() => {
    if (isSubmitting && Array.isArray(errors?.failureStrategies)) {
      const tabNum = errors.failureStrategies.findIndex(err => !isEmpty(err))

      if (tabNum > -1) {
        setSelectedStrategyNum(tabNum)
      }
    }
  }, [isSubmitting, errors])

  return (
    <div data-testid="failure-strategy-panel" className={css.main}>
      <String className={css.helpText} stringID="pipeline.failureStrategies.helpText" />
      <div className={css.header}>
        <FieldArray name="failureStrategies">
          {({ push, remove }) => {
            const strategies = formValues.failureStrategies || /* istanbul ignore next */ []

            async function handleAdd(): Promise<void> {
              await submitForm()

              // only allow add if current tab has no errors
              /* istanbul ignore else */
              if (isEmpty(get(errors, `failureStrategies[${selectedStrategyNum}]`))) {
                uids.current.push(uuid())
                push({ onFailure: { errors: [], action: {} } })
                setSelectedStrategyNum(strategies.length)
              }
            }

            function handleRemove(): void {
              uids.current.splice(selectedStrategyNum, 1)
              remove(selectedStrategyNum)
            }

            return (
              <React.Fragment>
                <div className={css.tabs}>
                  {hasFailureStrategies ? (
                    <ul className={css.stepList}>
                      {strategies.map((_, i) => {
                        // generated uuid if they are not present
                        if (!uids.current[i]) {
                          uids.current[i] = uuid()
                        }

                        const key = uids.current[i]

                        return (
                          <li key={key} className={css.stepListItem}>
                            <Button
                              intent={i === selectedStrategyNum ? 'primary' : 'none'}
                              data-selected={i === selectedStrategyNum}
                              onClick={() => handleTabChange(i)}
                              className={css.stepListBtn}
                              data-testid={`failure-strategy-step-${i}`}
                            >
                              {i + 1}
                            </Button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                  <Button
                    intent="primary"
                    minimal
                    small
                    icon="plus"
                    iconProps={{ size: 12 }}
                    data-testid="add-failure-strategy"
                    onClick={handleAdd}
                    disabled={isAddBtnDisabled}
                    tooltip={
                      currentTabHasErrors
                        ? getString('pipeline.failureStrategies.tabHasErrors')
                        : addedAllStratgies
                        ? getString('pipeline.failureStrategies.addedAllStrategies')
                        : undefined
                    }
                  >
                    <String stringID="add" />
                  </Button>
                </div>
                {hasFailureStrategies && !isDefaultStageStrategy ? (
                  <Button
                    icon="trash"
                    minimal
                    small
                    disabled={isReadonly}
                    onClick={handleRemove}
                    iconProps={{ size: 12 }}
                    data-testid="remove-failure-strategy"
                  />
                ) : null}
              </React.Fragment>
            )
          }}
        </FieldArray>
      </div>
      {hasFailureStrategies ? (
        <React.Fragment>
          <FailureTypeMultiSelect
            name={`failureStrategies[${selectedStrategyNum}].onFailure.errors`}
            label={getString('pipeline.failureStrategies.onFailureOfType')}
            filterTypes={filterTypes}
            stageType={stageType}
            disabled={isReadonly}
          />
          <StrategySelection
            name={`failureStrategies[${selectedStrategyNum}].onFailure.action`}
            label={getString('pipeline.failureStrategies.performAction')}
            allowedStrategies={allowedStrategiesAsPerStep(stageType)[mode]}
            disabled={isReadonly}
          />
        </React.Fragment>
      ) : null}
    </div>
  )
}
