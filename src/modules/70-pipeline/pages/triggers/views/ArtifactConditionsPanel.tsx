import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import AddConditionsSection from './AddConditionsSection'
import css from './WebhookConditionsPanel.module.scss'

interface WebhookConditionsPanelPropsInterface {
  formikProps?: any
}

const ArtifactConditionsPanel: React.FC<WebhookConditionsPanelPropsInterface> = ({ formikProps }): JSX.Element => {
  const { values: formikValues, setFieldValue, errors } = formikProps
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

      <AddConditionsSection
        title=""
        key="eventConditions"
        fieldId="eventConditions"
        attributePlaceholder="<+trigger.event.pathInJson>"
        formikValues={formikValues}
        setFieldValue={setFieldValue}
        errors={errors}
      />
    </Layout.Vertical>
  )
}
export default ArtifactConditionsPanel
