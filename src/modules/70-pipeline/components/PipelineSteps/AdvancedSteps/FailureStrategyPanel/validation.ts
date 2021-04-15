import * as Yup from 'yup'
import { omit } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'

import type { UseStringsReturn } from 'framework/exports'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { ErrorType, Strategy } from './StrategySelection/StrategyConfig'

const MAX_RETRIES = 10000

function getRetryActionBaseFields(getString: UseStringsReturn['getString']): Record<string, Yup.Schema<unknown>> {
  return {
    retryCount: Yup.mixed().test({
      name: 'failureStrategies-retryCount',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      test(value: any) {
        if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
          return true
        }

        const schema = Yup.number()
          .typeError(getString('pipeline.failureStrategies.validation.retryCountInteger'))
          .integer(getString('pipeline.failureStrategies.validation.retryCountInteger'))
          .min(1, getString('pipeline.failureStrategies.validation.retryCountMinimum'))
          .max(
            MAX_RETRIES,
            getString('pipeline.failureStrategies.validation.retryCountMaximum', { count: MAX_RETRIES })
          )
          .required(getString('pipeline.failureStrategies.validation.retryCountRequired'))

        try {
          schema.validateSync(value)
          return true
        } catch (e) {
          return this.createError({ message: e.message })
        }
      }
    }),
    retryIntervals: Yup.array()
      .of(
        getDurationValidationSchema().required(getString('pipeline.failureStrategies.validation.retryIntervalRequired'))
      )
      .min(1, getString('pipeline.failureStrategies.validation.retryIntervalMinimum'))
      .required(getString('pipeline.failureStrategies.validation.retryIntervalRequired'))
  }
}

function getManualInterventionBaseFields(
  getString: UseStringsReturn['getString']
): Record<string, Yup.Schema<unknown>> {
  return {
    timeout: getDurationValidationSchema().required(getString('pipeline.failureStrategies.validation.timeoutRequired'))
  }
}

export function getFailureStrategiesValidationSchema(
  getString: UseStringsReturn['getString']
): Yup.NotRequiredArraySchema<unknown> {
  return Yup.array().of(
    Yup.object()
      .shape({
        onFailure: Yup.object()
          .shape({
            errors: Yup.array()
              .of(Yup.mixed().oneOf(Object.values(ErrorType)).required())
              .min(1, getString('pipeline.failureStrategies.validation.errorsMinimum'))
              .required(getString('pipeline.failureStrategies.validation.errorsRequired')),
            action: Yup.object()
              .shape({
                type: Yup.mixed()
                  .oneOf(Object.values(Strategy))
                  .required(getString('pipeline.failureStrategies.validation.actionRequired')),
                spec: Yup.mixed()
                  .when('type', {
                    is: Strategy.Retry,
                    then: Yup.object()
                      .shape({
                        ...getRetryActionBaseFields(getString),
                        onRetryFailure: Yup.object()
                          .shape({
                            action: Yup.object().shape({
                              type: Yup.mixed()
                                .oneOf(Object.values(omit(Strategy, [Strategy.Retry])))
                                .required(getString('pipeline.failureStrategies.validation.onRetryFailureRequired')),
                              spec: Yup.mixed().when('type', {
                                is: Strategy.ManualIntervention,
                                then: Yup.object().shape({
                                  ...getManualInterventionBaseFields(getString),
                                  onTimeout: Yup.object().shape({
                                    action: Yup.object()
                                      .shape({
                                        type: Yup.mixed()
                                          .oneOf(
                                            Object.values(omit(Strategy, [Strategy.ManualIntervention, Strategy.Retry]))
                                          )
                                          .required(
                                            getString('pipeline.failureStrategies.validation.onTimeoutRequired')
                                          )
                                      })
                                      .required(getString('pipeline.failureStrategies.validation.onTimeoutRequired'))
                                      .required(getString('pipeline.failureStrategies.validation.onTimeoutRequired'))
                                  })
                                })
                              })
                            })
                          })
                          .required(getString('pipeline.failureStrategies.validation.onRetryFailureRequired'))
                      })
                      .required()
                  })
                  .when('type', {
                    is: Strategy.ManualIntervention,
                    then: Yup.object()
                      .shape({
                        ...getManualInterventionBaseFields(getString),
                        onTimeout: Yup.object().shape({
                          action: Yup.object()
                            .shape({
                              type: Yup.mixed()
                                .oneOf(Object.values(omit(Strategy, [Strategy.ManualIntervention])))
                                .required(getString('pipeline.failureStrategies.validation.onTimeoutRequired')),
                              spec: Yup.mixed().when('type', {
                                is: Strategy.Retry,
                                then: Yup.object()
                                  .shape({
                                    ...getRetryActionBaseFields(getString),
                                    onRetryFailure: Yup.object()
                                      .shape({
                                        action: Yup.object()
                                          .shape({
                                            type: Yup.mixed()
                                              .oneOf(
                                                Object.values(
                                                  omit(Strategy, [Strategy.Retry, Strategy.ManualIntervention])
                                                )
                                              )
                                              .required(
                                                getString(
                                                  'pipeline.failureStrategies.validation.onRetryFailureRequired'
                                                )
                                              )
                                          })
                                          .required(
                                            getString('pipeline.failureStrategies.validation.onRetryFailureRequired')
                                          )
                                      })
                                      .required(
                                        getString('pipeline.failureStrategies.validation.onRetryFailureRequired')
                                      )
                                  })
                                  .required(getString('pipeline.failureStrategies.validation.onRetryFailureRequired'))
                              })
                            })
                            .required(getString('pipeline.failureStrategies.validation.onTimeoutRequired'))
                        })
                      })
                      .required()
                  })
              })
              .required(getString('pipeline.failureStrategies.validation.actionRequired'))
          })
          .required()
      })
      .required()
  )
}
