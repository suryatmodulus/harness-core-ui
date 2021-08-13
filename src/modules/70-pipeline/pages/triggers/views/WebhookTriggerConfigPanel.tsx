import React, { useState, useEffect } from 'react'
import { Layout, FormInput, SelectOption, Text, Heading, Color } from '@wings-software/uicore'
import { isEmpty, isUndefined } from 'lodash-es'
import { useGetGitTriggerEventDetails } from 'services/pipeline-ng'
import { NameIdDescriptionTags } from '@common/components'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useStrings } from 'framework/strings'
import { GitSourceProviders, getSourceRepoOptions } from '../utils/TriggersListUtils'
import {
  eventTypes,
  autoAbortPreviousExecutionsTypes,
  getAutoAbortDescription,
  getEventAndActions
} from '../utils/TriggersWizardPageUtils'
import { ConnectorSection } from './ConnectorSection'
import css from './WebhookTriggerConfigPanel.module.scss'

export interface WebhookTriggerConfigPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const WebhookTriggerConfigPanel: React.FC<WebhookTriggerConfigPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}) => {
  const { sourceRepo, identifier, actions, event, connectorRef } = formikProps.values
  const {
    data: eventDetailsResponse,
    refetch: refetchEventDetails,
    error: eventDetailsError,
    loading: loadingGetGitTriggerEventDetails
  } = useGetGitTriggerEventDetails({
    // queryParams: { sourceRepo, event },
    lazy: true
  })

  const [eventOptions, setEventOptions] = useState<SelectOption[]>([])
  const [actionsOptions, setActionsOptions] = useState<SelectOption[]>([])
  const [actionsOptionsMap, setActionsOptionsMap] = useState<{ [key: string]: string[] }>({})
  const { getString } = useStrings()
  const loading = false

  useEffect(() => {
    if (eventDetailsResponse?.data && !isEmpty(eventDetailsResponse.data) && sourceRepo && !eventDetailsError) {
      const { eventOptions: newEventOptions, actionsOptionsMap: newActionsOptionsMap } = getEventAndActions({
        data: eventDetailsResponse?.data,
        sourceRepo
      })

      setEventOptions(newEventOptions)
      setActionsOptionsMap(newActionsOptionsMap)

      if (event) {
        if (isUndefined(newActionsOptionsMap[event])) {
          formikProps.setFieldValue('event', undefined)
          return
        }

        const newActionsOptions = newActionsOptionsMap[event]?.map((val: string) => ({ label: val, value: val }))
        setActionsOptions(newActionsOptions)
        if (newActionsOptions?.length === 0) {
          formikProps.setFieldValue('actions', [])
        }
      }
    }
  }, [eventDetailsResponse?.data, sourceRepo])

  useEffect(() => {
    if (!isEmpty(actionsOptionsMap) && event) {
      const newActionsOptions = actionsOptionsMap[event]?.map(val => ({ label: val, value: val }))
      setActionsOptions(newActionsOptions)
    }
  }, [event, actions])

  useEffect(() => {
    if (sourceRepo !== GitSourceProviders.CUSTOM.value && !eventDetailsResponse && !loadingGetGitTriggerEventDetails) {
      refetchEventDetails()
    }
  }, [sourceRepo])

  useEffect(() => {
    if (event && identifier && connectorRef) {
      // handle lack of validating when value present
      // identifier/connector needed otherwise page crash when event clicked first
      formikProps.validateForm()
    }
    if (
      Object.keys(formikProps.errors || {})?.includes('connectorRef') &&
      !Object.keys(formikProps.touched || {})?.includes('connectorRef') &&
      formikProps.submitCount === 0
    ) {
      const newErrors = { ...formikProps.errors }
      delete newErrors.connectorRef
      formikProps.setErrors(newErrors)
    }
  }, [event, formikProps.errors])

  return (
    <Layout.Vertical className={css.webhookConfigurationContainer} padding="xxlarge">
      {loading && (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
      <h2 className={css.heading}>{`${getString('pipeline.triggers.triggerConfigurationLabel')}${
        !isEdit ? `: ${getString('pipeline.triggers.onNewWebhookTitle')}` : ''
      }`}</h2>
      <div style={{ backgroundColor: 'var(--white)' }}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
          tooltipProps={{
            dataTooltipId: 'webhookTrigger'
          }}
        />
        <Heading className={css.listenOnNewWebhook} style={{ marginTop: '0!important' }} level={2}>
          {getString('pipeline.triggers.triggerConfigurationPanel.listenOnNewWebhook')}
        </Heading>
        <section style={{ width: '650px', marginTop: 'var(--spacing-small)' }}>
          <FormInput.Select
            label={getString('pipeline.triggers.triggerConfigurationPanel.payloadType')}
            name="sourceRepo"
            items={getSourceRepoOptions(getString)}
            onChange={e => {
              if (e.value === GitSourceProviders.CUSTOM.value) {
                formikProps.setValues({
                  ...formikProps.values,
                  sourceRepo: e.value,
                  connectorRef: undefined,
                  repoName: '',
                  actions: undefined,
                  anyAction: false,
                  secretToken: undefined
                })
              } else {
                formikProps.setValues({
                  ...formikProps.values,
                  sourceRepo: e.value,
                  connectorRef: undefined,
                  repoName: '',
                  actions: undefined,
                  anyAction: false,
                  secretToken: undefined,
                  headerConditions: undefined
                })
              }
            }}
          />
          {sourceRepo !== GitSourceProviders.CUSTOM.value ? (
            <>
              {sourceRepo && <ConnectorSection formikProps={formikProps} />}
              <FormInput.Select
                key={event}
                label={getString('pipeline.triggers.triggerConfigurationPanel.event')}
                name="event"
                placeholder={getString('pipeline.triggers.triggerConfigurationPanel.eventPlaceholder')}
                items={eventOptions}
                onChange={e => {
                  const additionalValues: any = {}

                  if (e.value === eventTypes.PUSH) {
                    additionalValues.sourceBranchOperator = undefined
                    additionalValues.sourceBranchValue = undefined
                  }

                  if (e.value !== eventTypes.TAG) {
                    additionalValues.tagConditionOperator = undefined
                    additionalValues.tagConditionValue = undefined
                  }

                  formikProps.setValues({
                    ...formikProps.values,
                    event: e.value,
                    actions: e.value === eventTypes.PUSH ? [] : undefined,
                    anyAction: false,
                    ...additionalValues
                  })
                }}
              />
              {event && (
                <>
                  {actionsOptions?.length !== 0 && (
                    <div className={css.actionsContainer}>
                      <div>
                        <Text style={{ fontSize: 13, marginBottom: 'var(--spacing-xsmall)' }}>
                          {getString('pipeline.triggers.triggerConfigurationPanel.actions')}
                        </Text>
                        <FormInput.MultiSelect
                          className={css.multiSelect}
                          name="actions"
                          items={actionsOptions}
                          // yaml design: empty array means selecting all
                          disabled={Array.isArray(actions) && isEmpty(actions)}
                          onChange={e => {
                            if (!e || (Array.isArray(e) && isEmpty(e))) {
                              formikProps.setFieldValue('actions', undefined)
                            } else {
                              formikProps.setFieldValue('actions', e)
                            }
                          }}
                        />
                      </div>
                      <FormInput.CheckBox
                        name="anyAction"
                        key={Date.now()}
                        label={getString('pipeline.triggers.triggerConfigurationPanel.anyActions')}
                        defaultChecked={(Array.isArray(actions) && actions.length === 0) || false}
                        className={css.checkboxAlignment}
                        onClick={(e: React.FormEvent<HTMLInputElement>) => {
                          formikProps.setFieldTouched('actions', true)
                          if (e.currentTarget?.checked) {
                            formikProps.setFieldValue('actions', [])
                          } else {
                            formikProps.setFieldValue('actions', undefined)
                          }
                        }}
                      />
                    </div>
                  )}
                  {autoAbortPreviousExecutionsTypes.includes(event) && (
                    <>
                      <FormInput.CheckBox
                        style={{ position: 'relative', left: '0' }}
                        name="autoAbortPreviousExecutions"
                        label="Auto-abort Previous Execution"
                        className={css.checkboxAlignment}
                      />
                      <Text
                        style={{
                          marginBottom: 'var(--spacing-medium)',
                          marginLeft: '29px',
                          position: 'relative',
                          top: '-10px'
                        }}
                        color={Color.GREY_400}
                      >
                        {getAutoAbortDescription({ event, getString })}
                      </Text>
                    </>
                  )}
                </>
              )}
            </>
          ) : null}
        </section>
      </div>
    </Layout.Vertical>
  )
}
export default WebhookTriggerConfigPanel
