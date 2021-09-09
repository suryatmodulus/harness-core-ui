import {
  Button,
  ButtonVariation,
  Color,
  Formik,
  FormInput,
  Layout,
  MultiSelectOption,
  StepProps,
  Text
} from '@wings-software/uicore'
import React from 'react'
import { Form } from 'formik'
import { startCase } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { NotificationRules, PipelineEvent } from 'services/pipeline-ng'
import css from '../useNotificationModal.module.scss'

export enum PipelineEventType {
  ALL_EVENTS = 'AllEvents',
  PipelineSuccess = 'PipelineSuccess',
  PipelineFailed = 'PipelineFailed',
  PipelinePaused = 'PipelinePaused',
  StageSuccess = 'StageSuccess',
  StageFailed = 'StageFailed',
  StageStart = 'StageStart',
  StepFailed = 'StepFailed',
  PipelineEnd = 'PipelineEnd',
  PipelineStart = 'PipelineStart'
}

const pipelineEventItems = [
  {
    label: startCase(PipelineEventType.ALL_EVENTS),
    value: PipelineEventType.ALL_EVENTS
  },
  {
    label: startCase(PipelineEventType.PipelineStart),
    value: PipelineEventType.PipelineStart
  },
  {
    label: startCase(PipelineEventType.PipelineEnd),
    value: PipelineEventType.PipelineEnd
  },

  {
    label: startCase(PipelineEventType.PipelineSuccess),
    value: PipelineEventType.PipelineSuccess
  },
  {
    label: startCase(PipelineEventType.PipelineFailed),
    value: PipelineEventType.PipelineFailed
  },
  {
    label: startCase(PipelineEventType.PipelinePaused),
    value: PipelineEventType.PipelinePaused
  },
  {
    label: startCase(PipelineEventType.StageFailed),
    value: PipelineEventType.StageFailed
  },
  {
    label: startCase(PipelineEventType.StageSuccess),
    value: PipelineEventType.StageSuccess
  },
  {
    label: startCase(PipelineEventType.StageStart),
    value: PipelineEventType.StageStart
  },
  {
    label: startCase(PipelineEventType.StepFailed),
    value: PipelineEventType.StepFailed
  }
]

interface PipelineEventsFormData {
  types: { [key: string]: any }
  [key: string]: any
}

type PipelineEventsProps = StepProps<NotificationRules> & { stagesOptions?: MultiSelectOption[] }

const PipelineEvents: React.FC<PipelineEventsProps> = ({ nextStep, prevStepData, stagesOptions }) => {
  const { getString } = useStrings()
  const initialValues: PipelineEventsFormData = { types: {} }
  const types: Required<PipelineEventsFormData>['types'] = {}

  const getStageOption = (stageId: string) => {
    return stagesOptions?.find(item => item.value === stageId)
  }

  prevStepData?.pipelineEvents?.map(event => {
    const type = event.type
    if (type) {
      types[type] = true
      if (event.forStages?.length) {
        initialValues[type] = event.forStages.map(stageId => getStageOption(stageId)).filter(item => !!item)
      }
    }
  })

  return (
    <Layout.Vertical spacing="xxlarge" padding="small">
      <Text font="medium" color={Color.BLACK}>
        {getString('notifications.pipelineEvents')}
      </Text>
      <Formik<PipelineEventsFormData>
        initialValues={{ ...initialValues, types }}
        formName="pipelineEvents"
        onSubmit={values => {
          const pipelineEvents: PipelineEvent[] = Object.keys(values.types)
            .filter(function (k) {
              return values.types[k]
            })
            .map(value => {
              const dataToSubmit: PipelineEvent = { type: value as PipelineEventType }
              if (values[value]?.length)
                dataToSubmit['forStages'] = values[value].map((item: { value: string }) => item.value)
              return dataToSubmit
            })

          nextStep?.({ ...prevStepData, pipelineEvents })
        }}
      >
        {formikProps => {
          return (
            <Form>
              <Layout.Vertical spacing="medium" className={css.formContent}>
                <Text margin={{ bottom: 'large' }}>{getString('notifications.selectPipelineEvents')} </Text>
                {pipelineEventItems.map(event => {
                  return (
                    <Layout.Vertical key={event.label}>
                      <Layout.Horizontal margin={{ bottom: 'small' }} flex>
                        <FormInput.CheckBox
                          className={formikProps.values.types[event.value] ? 'checked' : 'unchecked'}
                          name={`types.${event.value}`}
                          checked={formikProps.values.types[event.label]}
                          label={event.label}
                          padding={{ left: 'xxxlarge' }}
                          onChange={e => {
                            if (e.currentTarget.checked) {
                              if (event.value === PipelineEventType.ALL_EVENTS) {
                                Object.keys(formikProps.values.types).forEach(item => {
                                  item !== PipelineEventType.ALL_EVENTS
                                    ? (formikProps.values.types[item] = false)
                                    : (formikProps.values.types[item] = true)
                                })
                              } else {
                                formikProps.values.types[PipelineEventType.ALL_EVENTS] = false
                              }
                            }
                          }}
                        />
                        {(event.value === PipelineEventType.StageSuccess ||
                          event.value === PipelineEventType.StageFailed ||
                          event.value === PipelineEventType.StageStart) && (
                          <FormInput.MultiSelect
                            disabled={!formikProps.values.types[event.value]}
                            className={css.stagesMultiSelect}
                            items={stagesOptions || []}
                            name={event.value}
                            label={''}
                            multiSelectProps={{
                              placeholder: getString('notifications.selectStagesPlaceholder'),
                              allowCreatingNewItems: false
                            }}
                          />
                        )}
                      </Layout.Horizontal>
                    </Layout.Vertical>
                  )
                })}
              </Layout.Vertical>
              <Button
                type="submit"
                variation={ButtonVariation.PRIMARY}
                rightIcon="chevron-right"
                text={getString('continue')}
              />
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default PipelineEvents
