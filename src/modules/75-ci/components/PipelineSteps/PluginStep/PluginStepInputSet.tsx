import React from 'react'
import { Text, FormInput, Button, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import Map from '@common/components/Map/Map'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import type { PluginStepProps } from './PluginStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const PluginStepInputSet: React.FC<PluginStepProps> = ({ template, path, readonly }) => {
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormConnectorReferenceField
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.connectorLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.connectorInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          type={['Gcp', 'Aws', 'DockerRegistry']}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={560}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.connectorRef`}
          placeholder={getString('select')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.image`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('imageLabel')}
              <Button icon="question" minimal tooltip={getString('pluginImageInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          placeholder={getString('pluginImagePlaceholder')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.privileged) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          className={css.checkbox}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.privileged`}
          label={getString('ci.privileged')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.settings as string) === MultiTypeInputType.RUNTIME && (
        <Map
          name={`${isEmpty(path) ? '' : `${path}.`}spec.settings`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('settingsLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.settingsInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
