import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import { ConditionRow } from './AddConditionsSection'
import css from './WebhookConditionsPanel.module.scss'

interface WebhookConditionsPanelPropsInterface {
  formikProps?: any
}

const ArtifactConditionsPanel: React.FC<WebhookConditionsPanelPropsInterface> = ({ formikProps }): JSX.Element => {
  const {
    values: { manifestType }
  } = formikProps
  const { getString } = useStrings()
  const isManifest = !!manifestType
  return (
    <Layout.Vertical className={cx(css.webhookConditionsContainer)} spacing="large" padding="xxlarge">
      <h2 className={css.heading}>
        {getString('conditions')}{' '}
        <Text style={{ display: 'inline-block' }} color="grey400">
          {getString('titleOptional')}
        </Text>
      </h2>
      <Text>
        {isManifest
          ? getString('pipeline.triggers.conditionsPanel.subtitle')
          : getString('pipeline.triggers.conditionsPanel.subtitle')}
      </Text>
      {isManifest ? (
        <ConditionRow
          formikProps={formikProps}
          name="version"
          label={getString('pipeline.triggers.conditionsPanel.manifestVersion')}
        />
      ) : (
        <ConditionRow
          formikProps={formikProps}
          name="build"
          label={getString('pipeline.triggers.conditionsPanel.artifactBuild')}
        />
      )}
    </Layout.Vertical>
  )
}
export default ArtifactConditionsPanel
