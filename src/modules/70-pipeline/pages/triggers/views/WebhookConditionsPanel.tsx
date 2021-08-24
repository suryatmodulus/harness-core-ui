import React from 'react'
import { Layout, FormInput, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { eventTypes } from '../utils/TriggersWizardPageUtils'
import { GitSourceProviders } from '../utils/TriggersListUtils'
import AddConditionsSection, { ConditionRow } from './AddConditionsSection'
import css from './WebhookConditionsPanel.module.scss'

interface WebhookConditionsPanelPropsInterface {
  formikProps?: any
}

const WebhookConditionsPanel: React.FC<WebhookConditionsPanelPropsInterface> = ({ formikProps }): JSX.Element => {
  const {
    values: { event, sourceRepo },
    values: formikValues,
    setFieldValue,
    errors
  } = formikProps
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={cx(css.webhookConditionsContainer)} spacing="large" padding="xxlarge">
      <h2 className={css.heading}>
        {getString('conditions')}{' '}
        <Text style={{ display: 'inline-block' }} color="grey400">
          {getString('titleOptional')}
        </Text>
      </h2>
      <Text>{getString('pipeline.triggers.conditionsPanel.subtitle')}</Text>
      {sourceRepo !== GitSourceProviders.CUSTOM.value && (
        <section>
          {event !== eventTypes.PUSH && event !== eventTypes.TAG && (
            <ConditionRow
              formikProps={formikProps}
              name="sourceBranch"
              label={getString('pipeline.triggers.conditionsPanel.sourceBranch')}
            />
          )}
          {event !== eventTypes.TAG && (
            <ConditionRow
              formikProps={formikProps}
              name="targetBranch"
              label={
                event === eventTypes.PUSH
                  ? getString('pipeline.triggers.conditionsPanel.branchName')
                  : getString('pipeline.triggers.conditionsPanel.targetBranch')
              }
            />
          )}
          {event !== eventTypes.TAG && sourceRepo !== GitSourceProviders.AWS_CODECOMMIT.value && (
            <ConditionRow
              formikProps={formikProps}
              name="changedFiles"
              label={getString('pipeline.triggers.conditionsPanel.changedFiles')}
            />
          )}
          {event === eventTypes.TAG && (
            <ConditionRow
              formikProps={formikProps}
              name="tagCondition"
              label={getString('pipeline.triggers.conditionsPanel.tagName')}
            />
          )}
        </section>
      )}
      <AddConditionsSection
        title={getString('pipeline.triggers.conditionsPanel.headerConditions')}
        key="headerConditions"
        fieldId="headerConditions"
        attributePlaceholder="<+trigger.header['key-name']>"
        formikValues={formikValues}
        setFieldValue={setFieldValue}
        errors={errors}
      />
      <AddConditionsSection
        title={getString('pipeline.triggers.conditionsPanel.payloadConditions')}
        key="payloadConditions"
        fieldId="payloadConditions"
        attributePlaceholder="<+trigger.payload.pathInJson>"
        formikValues={formikValues}
        setFieldValue={setFieldValue}
        errors={errors}
      />
      <FormInput.Text
        style={{ width: '100%' }}
        name="jexlCondition"
        label={getString('pipeline.triggers.conditionsPanel.jexlCondition')}
        placeholder={getString('pipeline.triggers.conditionsPanel.jexlConditionPlaceholder')}
      />
    </Layout.Vertical>
  )
}
export default WebhookConditionsPanel
