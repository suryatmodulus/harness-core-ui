import React from 'react'
import { Layout, FormInput, Heading, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { eventTypes } from '../utils/TriggersWizardPageUtils'
import { GitSourceProviders } from '../utils/TriggersListUtils'
import AddConditionsSection from './AddConditionsSection'
import css from './WebhookConditionsPanel.module.scss'

export const mockOperators = [
  { label: '', value: '' },
  { label: 'equals', value: 'equals' },
  { label: 'not equals', value: 'not equals' },
  { label: 'in', value: 'in' },
  { label: 'not in', value: 'not in' },
  { label: 'starts with', value: 'starts with' },
  { label: 'ends with', value: 'ends with' },
  { label: 'regex', value: 'regex' }
]

interface WebhookConditionsPanelPropsInterface {
  formikProps?: any
}

export const ConditionRow = ({
  formikProps,
  name,
  label
}: {
  formikProps: any
  name: string
  label: string
}): JSX.Element => {
  const { getString } = useStrings()
  const operatorKey = `${name}Operator`
  const valueKey = `${name}Value`
  const operatorError = formikProps?.errors?.[operatorKey]
  const valueError = formikProps?.errors?.[valueKey]
  return (
    <div className={css.conditionsRow}>
      <div>
        <Text style={{ fontSize: 16 }}>{label}</Text>
      </div>
      <FormInput.Select
        style={{ alignSelf: valueError ? 'baseline' : 'center' }}
        items={mockOperators}
        name={operatorKey}
        label={getString('pipeline-triggers.conditionsPanel.operator')}
        onChange={() => {
          formikProps.setFieldTouched(valueKey, true)
        }}
      />
      <FormInput.Text
        name={valueKey}
        style={{ alignSelf: operatorError ? 'baseline' : 'center' }}
        label={getString('pipeline-triggers.conditionsPanel.matchesValue')}
        onChange={() => {
          formikProps.setFieldTouched(operatorKey, true)
        }}
      />
    </div>
  )
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
      <Text>{getString('pipeline-triggers.conditionsPanel.subtitle')}</Text>
      {sourceRepo !== GitSourceProviders.CUSTOM.value && (
        <section>
          <Heading level={2} font={{ weight: 'bold' }}>
            {getString('pipeline-triggers.conditionsPanel.branchConditions')}
          </Heading>
          {event !== eventTypes.PUSH && event !== eventTypes.TAG && (
            <ConditionRow
              formikProps={formikProps}
              name="sourceBranch"
              label={getString('pipeline-triggers.conditionsPanel.sourceBranch')}
            />
          )}
          {event !== eventTypes.TAG && (
            <ConditionRow
              formikProps={formikProps}
              name="targetBranch"
              label={
                event === eventTypes.PUSH
                  ? getString('pipeline-triggers.conditionsPanel.branchName')
                  : getString('pipeline-triggers.conditionsPanel.targetBranch')
              }
            />
          )}
          {event === eventTypes.TAG && (
            <ConditionRow
              formikProps={formikProps}
              name="tagCondition"
              label={getString('pipeline-triggers.conditionsPanel.tagName')}
            />
          )}
        </section>
      )}
      <AddConditionsSection
        title={getString('pipeline-triggers.conditionsPanel.headerConditions')}
        key="headerConditions"
        fieldId="headerConditions"
        formikValues={formikValues}
        setFieldValue={setFieldValue}
        errors={errors}
      />
      <AddConditionsSection
        title={getString('pipeline-triggers.conditionsPanel.payloadConditions')}
        key="payloadConditions"
        fieldId="payloadConditions"
        formikValues={formikValues}
        setFieldValue={setFieldValue}
        errors={errors}
      />
      <FormInput.Text
        style={{ width: '100%' }}
        name="jexlCondition"
        label={getString('pipeline-triggers.conditionsPanel.jexlCondition')}
      />
    </Layout.Vertical>
  )
}
export default WebhookConditionsPanel
