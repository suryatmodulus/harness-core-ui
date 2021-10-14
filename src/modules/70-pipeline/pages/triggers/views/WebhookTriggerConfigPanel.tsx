import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { Layout, FormInput, SelectOption, Text, HarnessDocTooltip } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useGetGitTriggerEventDetails } from 'services/pipeline-ng'
import { NameIdDescriptionTags } from '@common/components'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useStrings } from 'framework/strings'
import { GitSourceProviders, getSourceRepoOptions } from '../utils/TriggersListUtils'
import {
  handleSourceRepoChange,
  renderNonCustomEventFields,
  getEventAndActions,
  clearEventsAndActions
} from '../utils/WebhookTriggerConfigPanelUtils'
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
        clearEventsAndActions({ newActionsOptionsMap, formikProps, setActionsOptions, event })
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
      Object.keys(formikProps.errors)?.includes('connectorRef') && // check that this does not break for keys of
      !Object.keys(formikProps.touched)?.includes('connectorRef') &&
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
      <Text className={css.formContentTitle} inline={true} data-tooltip-id="triggerConfigurationLabel">
        {getString('pipeline.triggers.triggerConfigurationLabel')}
        {!isEdit ? `: ${getString('pipeline.triggers.onNewWebhookTitle')}` : ''}
      </Text>
      <HarnessDocTooltip tooltipId="triggerConfigurationLabel" useStandAlone={true} />

      <div className={css.formContent}>
        <NameIdDescriptionTags
          className={cx(css.nameIdDescriptionTags, css.bottomMarginZero)}
          formikProps={formikProps}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
          tooltipProps={{
            dataTooltipId: 'webhookTrigger'
          }}
        />
      </div>
      <Text className={css.formContentTitle} inline={true} data-tooltip-id="listenOnNewWebhook">
        {getString('pipeline.triggers.triggerConfigurationPanel.listenOnNewWebhook')}
      </Text>
      <HarnessDocTooltip tooltipId="listenOnNewWebhook" useStandAlone={true} />
      <div className={css.formContent}>
        <section style={{ width: '650px' }}>
          <FormInput.Select
            label={getString('pipeline.triggers.triggerConfigurationPanel.payloadType')}
            name="sourceRepo"
            className={cx(sourceRepo === GitSourceProviders.CUSTOM.value && css.bottomMarginZero)}
            items={getSourceRepoOptions(getString)}
            onChange={e => handleSourceRepoChange({ e, formikProps })}
          />
          {sourceRepo !== GitSourceProviders.CUSTOM.value
            ? renderNonCustomEventFields({
                sourceRepo,
                formikProps,
                event,
                eventOptions,
                getString,
                actionsOptions,
                actions
              })
            : null}
        </section>
      </div>
    </Layout.Vertical>
  )
}
export default WebhookTriggerConfigPanel
