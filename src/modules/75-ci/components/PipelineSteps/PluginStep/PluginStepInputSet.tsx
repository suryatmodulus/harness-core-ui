import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import MultiTypeMapInputSet from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { PluginStepProps } from './PluginStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const PluginStepInputSet: React.FC<PluginStepProps> = ({ template, path, readonly }) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const {
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier: repo = '',
    branch
  } = useParams<
    {
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    } & GitQueryParams
  >()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      {getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeTextAreaField
          multiTypeTextArea={{
            expressions,
            disabled: readonly,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}description`}
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('description')}</Text>}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'connector' }}>
              {getString('pipelineSteps.connectorLabel')}
            </Text>
          }
          type={['Gcp', 'Aws', 'DockerRegistry']}
          setRefValue
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={560}
          gitScope={{ branch, repo, getDefaultFromOtherRepo: true }}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.connectorRef`}
          placeholder={getString('select')}
          multiTypeProps={{
            expressions,
            disabled: readonly,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.image`}
          label={
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{
                dataTooltipId: 'pluginImageInfo'
              }}
            >
              {getString('imageLabel')}
            </Text>
          }
          multiTextInputProps={{
            placeholder: getString('pluginImagePlaceholder'),
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.privileged) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeCheckboxField
          name={`${isEmpty(path) ? '' : `${path}.`}spec.privileged`}
          label={getString('ci.privileged')}
          multiTypeTextbox={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          tooltipProps={{ dataTooltipId: 'privileged' }}
          disabled={readonly}
          setToFalseWhenEmpty={true}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.settings as string) === MultiTypeInputType.RUNTIME && (
        <MultiTypeMapInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.settings`}
          valueMultiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{ dataTooltipId: 'pluginSettings' }}
              >
                {getString('settingsLabel')}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
