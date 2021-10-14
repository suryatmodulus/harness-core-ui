import React from 'react'
import { Layout, FormInput, Text, Color, HarnessDocTooltip } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { eventTypes } from '../utils/TriggersWizardPageUtils'
import { GitSourceProviders } from '../utils/TriggersListUtils'
import AddConditionsSection, { ConditionRow, ConditionsRowHeaders } from './AddConditionsSection'
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
      <Text
        style={{ fontSize: '16px' }}
        font={{ weight: 'bold' }}
        inline={true}
        color={Color.GREY_800}
        data-tooltip-id="conditionsOptional"
      >
        {getString('conditions')}
        <Text style={{ display: 'inline-block', fontSize: '16px' }} color={Color.GREY_500}>
          {getString('titleOptional')}
        </Text>
      </Text>
      <HarnessDocTooltip tooltipId="conditionsOptional" useStandAlone={true} />
      <Text
        color={Color.BLACK}
        style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-large)' }}
        data-tooltip-id="conditionsSubtitle"
      >
        {getString('pipeline.triggers.conditionsPanel.subtitle')}
      </Text>
      <HarnessDocTooltip tooltipId="conditionsSubtitle" useStandAlone={true} />
      {sourceRepo !== GitSourceProviders.CUSTOM.value && (
        <Layout.Vertical className={css.formContent} style={{ marginBottom: 'var(--spacing-4)!important' }}>
          <section>
            <ConditionsRowHeaders getString={getString} />
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
        </Layout.Vertical>
      )}
      <Layout.Vertical className={css.formContent}>
        <AddConditionsSection
          title={getString('pipeline.triggers.conditionsPanel.headerConditions')}
          key="headerConditions"
          fieldId="headerConditions"
          attributePlaceholder="<+trigger.header['key-name']>"
          formikValues={formikValues}
          setFieldValue={setFieldValue}
          errors={errors}
        />
      </Layout.Vertical>
      <Layout.Vertical className={css.formContent}>
        <AddConditionsSection
          title={getString('pipeline.triggers.conditionsPanel.payloadConditions')}
          key="payloadConditions"
          fieldId="payloadConditions"
          attributePlaceholder="<+trigger.payload.pathInJson>"
          formikValues={formikValues}
          setFieldValue={setFieldValue}
          errors={errors}
        />
      </Layout.Vertical>
      <Layout.Vertical className={css.formContent}>
        <Text className={css.sectionHeader}>{getString('pipeline.triggers.conditionsPanel.jexlCondition')}</Text>
        <FormInput.Text
          style={{ width: '100%', marginBottom: '0' }}
          name="jexlCondition"
          label=""
          placeholder={getString('pipeline.triggers.conditionsPanel.jexlConditionPlaceholder')}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default WebhookConditionsPanel
