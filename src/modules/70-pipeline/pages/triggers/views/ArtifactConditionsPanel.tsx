import React from 'react'
import { HarnessDocTooltip, Layout, Text, Color } from '@wings-software/uicore'
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
      <>
        <Text
          style={{ fontSize: '16px' }}
          font={{ weight: 'bold' }}
          inline={true}
          color={Color.GREY_800}
          data-tooltip-id="artifactManifestConditions"
        >
          {getString('conditions')}
          <Text style={{ display: 'inline-block' }} color={Color.GREY_500}>
            {getString('titleOptional')}
          </Text>
        </Text>
        <HarnessDocTooltip tooltipId="artifactManifestConditions" useStandAlone={true} />
      </>
      <>
        <Text
          color={Color.BLACK}
          style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-large)' }}
          data-tooltip-id="artifactManifestConditionSubtitle"
        >
          {getString('pipeline.triggers.conditionsPanel.subtitle')}
        </Text>
        <HarnessDocTooltip tooltipId="artifactManifestConditionSubtitle" useStandAlone={true} />
      </>
      <Layout.Vertical className={css.formContent}>
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
    </Layout.Vertical>
  )
}
export default ArtifactConditionsPanel
