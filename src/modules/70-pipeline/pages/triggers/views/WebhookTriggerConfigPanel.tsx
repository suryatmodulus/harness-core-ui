import React, { useState, useEffect } from 'react'
import { Layout, FormInput, SelectOption, Text, Heading, Container, Icon, Button, Color } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import { useGetActionsList, useGetSourceRepoToEvent, useGenerateWebhookToken } from 'services/pipeline-ng'
import { NameIdDescriptionTags } from '@common/components'
import { PageSpinner } from '@common/components/Page/PageSpinner'

import { useToaster } from '@common/exports'
import { useStrings } from 'framework/exports'
import { GitSourceProviders, getSourceRepoOptions } from '../utils/TriggersListUtils'
import { eventTypes } from '../utils/TriggersWizardPageUtils'
import { ConnectorSection } from './ConnectorSection'
import css from './WebhookTriggerConfigPanel.module.scss'

export interface WebhookTriggerConfigPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
  enableSecureToken?: boolean
}

const WebhookTriggerConfigPanel: React.FC<WebhookTriggerConfigPanelPropsInterface> = ({
  formikProps,
  enableSecureToken = false, // enable later with proper security handling
  isEdit = false
}) => {
  const { sourceRepo, identifier, actions, anyAction, event, connectorRef } = formikProps.values
  const { data: ResponseSourceRepoToEvent, loading: loadingGetSourceRepoToEvent } = useGetSourceRepoToEvent({})
  const { data: actionsListResponse, refetch: refetchActions } = useGetActionsList({
    queryParams: { sourceRepo, event },
    lazy: true,
    debounce: 300
  })
  const {
    data: generateWebhookTokenResponse,
    loading: loadingSecureToken,
    refetch: refetchGenerateWebhookToken
  } = useGenerateWebhookToken({
    lazy: true
  })

  const [eventOptions, setEventOptions] = useState<SelectOption[]>([])
  const [actionsOptions, setActionsOptions] = useState<SelectOption[]>([]) // will need to get actions from api
  const { getString } = useStrings()
  const loading = loadingGetSourceRepoToEvent
  const { showSuccess, showError } = useToaster()

  useEffect(() => {
    if (sourceRepo && ResponseSourceRepoToEvent?.data?.[sourceRepo]) {
      const eventsList = ResponseSourceRepoToEvent.data[sourceRepo]
      if (eventsList.length) {
        setEventOptions(eventsList.map(e => ({ label: e, value: e })))
        if (event && !eventsList.includes(event)) {
          formikProps.setFieldValue('event', '')
        }
      }
    }
  }, [ResponseSourceRepoToEvent?.data, sourceRepo])

  useEffect(() => {
    if (generateWebhookTokenResponse?.resource) {
      formikProps.setFieldValue('secureToken', generateWebhookTokenResponse.resource)
    }
  }, [generateWebhookTokenResponse])

  useEffect(() => {
    if (actionsListResponse?.data) {
      const actionsOptionsKV = actionsListResponse.data.map(item => ({ label: item, value: item }))
      setActionsOptions(actionsOptionsKV)
      // undefined actions requires user to select value
      if (actionsOptionsKV.length === 0) {
        formikProps.setFieldValue('actions', [])
      } else if (actionsOptionsKV.length && !anyAction && Array.isArray(actions) && actions.length === 0) {
        formikProps.setFieldValue('actions', undefined)
      }
    }
  }, [actionsListResponse?.data])

  useEffect(() => {
    if (event && sourceRepo) {
      refetchActions()
    }
  }, [event, sourceRepo])

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
      <h2 className={css.heading}>{`${getString('pipeline-triggers.triggerConfigurationLabel')}${
        !isEdit ? `: ${getString('pipeline-triggers.onNewWebhookTitle')}` : ''
      }`}</h2>
      <div style={{ backgroundColor: 'var(--white)' }}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
        />
        <Heading className={css.listenOnNewWebhook} style={{ marginTop: '0!important' }} level={2}>
          {getString('pipeline-triggers.triggerConfigurationPanel.listenOnNewWebhook')}
        </Heading>
        <section style={{ width: '650px', marginTop: 'var(--spacing-small)' }}>
          <FormInput.Select
            label={getString('pipeline-triggers.triggerConfigurationPanel.payloadType')}
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
                label={getString('pipeline-triggers.triggerConfigurationPanel.event')}
                name="event"
                items={eventOptions}
                onChange={e => {
                  const additionalValues: any = {}

                  if (event === eventTypes.PUSH) {
                    additionalValues.sourceBranchOperator = undefined
                    additionalValues.sourceBranchValue = undefined
                  }

                  if (event !== eventTypes.TAG) {
                    additionalValues.tagConditionOperator = undefined
                    additionalValues.tagConditionValue = undefined
                  }

                  formikProps.setValues({
                    ...formikProps.values,
                    event: e.value,
                    actions: undefined,
                    anyAction: false,
                    ...additionalValues
                  })
                }}
              />
              {event && event !== eventTypes.PUSH && actionsOptions.length !== 0 && (
                <div className={css.actionsContainer}>
                  <div>
                    <Text style={{ fontSize: 13, marginBottom: 'var(--spacing-xsmall)' }}>
                      {getString('pipeline-triggers.triggerConfigurationPanel.actions')}
                    </Text>
                    <FormInput.MultiSelect
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
                    label={getString('pipeline-triggers.triggerConfigurationPanel.anyActions')}
                    defaultChecked={Array.isArray(actions) && actions.length === 0}
                    className={css.anyAction}
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
            </>
          ) : enableSecureToken ? (
            <>
              <Layout.Horizontal width={'324px'} style={{ justifyContent: 'space-between' }}>
                <Layout.Horizontal spacing="small">
                  <FormInput.CheckBox
                    style={{ paddingTop: 'var(--spacing-xsmall' }}
                    className={css.checkbox}
                    label={getString('secureToken')}
                    name="secureToken"
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                      if (!e.currentTarget.checked) {
                        formikProps.setFieldValue('secureToken', undefined)
                      } else {
                        refetchGenerateWebhookToken()
                      }
                    }}
                  />
                  {loadingSecureToken && <Spinner className={css.secureTokenLoader} size={Spinner.SIZE_SMALL} />}
                </Layout.Horizontal>
                <Container style={{ paddingBottom: 'var(--spacing-xsmall)' }}>
                  {isEdit && formikProps.initialValues.secureToken && (
                    <Button
                      className={css.regenerateButton}
                      data-name="regenerate-token"
                      icon="main-refresh"
                      tooltip={getString('pipeline-triggers.triggerConfigurationPanel.regenerateToken')}
                      tooltipProps={{ hoverOpenDelay: 300 }}
                      minimal
                      style={{ paddingLeft: 'var(--spacing-small)' }}
                      onClick={() => {
                        refetchGenerateWebhookToken()
                          .then(_res => {
                            showSuccess(getString('pipeline-triggers.triggerConfigurationPanel.regeneratedToken'))
                          })
                          .catch(_err => showError(getString('commonError')))
                      }}
                    />
                  )}
                </Container>
              </Layout.Horizontal>
              {isEdit && formikProps.initialValues.secureToken && (
                <Layout.Horizontal spacing="small" className={css.fieldWarning}>
                  <Icon name="main-warning" color={Color.YELLOW_500} />
                  <Text color={Color.GREY_800}>
                    {getString('pipeline-triggers.triggerConfigurationPanel.secureTokenRegenerateWarning')}
                  </Text>
                </Layout.Horizontal>
              )}
            </>
          ) : null}
        </section>
      </div>
    </Layout.Vertical>
  )
}
export default WebhookTriggerConfigPanel
