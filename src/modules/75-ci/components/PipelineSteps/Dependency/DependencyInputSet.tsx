import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import MultiTypeMapInputSet from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import type { DependencyProps } from './Dependency'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const DependencyInputSet: React.FC<DependencyProps> = ({ template, path, readonly }) => {
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { expressions } = useVariablesExpression()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      {getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeTextAreaField
          name={`${isEmpty(path) ? '' : `${path}.`}description`}
          label={getString('description')}
          multiTypeTextArea={{
            expressions,
            disabled: readonly,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          label={
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{
                dataTooltipId: 'dependencyConnectorInfo'
              }}
            >
              {getString('pipelineSteps.connectorLabel')}
            </Text>
          }
          type={['Gcp', 'Aws', 'DockerRegistry']}
          setRefValue
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={560}
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
                dataTooltipId: 'image'
              }}
            >
              {getString('imageLabel')}
            </Text>
          }
          multiTextInputProps={{
            placeholder: getString('dependencyImagePlaceholder'),
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
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          tooltipProps={{ dataTooltipId: 'privileged' }}
          disabled={readonly}
          setToFalseWhenEmpty={true}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.envVariables as string) === MultiTypeInputType.RUNTIME && (
        <MultiTypeMapInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.envVariables`}
          valueMultiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{
                  dataTooltipId: 'dependencyEnvironmentVariables'
                }}
              >
                {getString('environmentVariables')}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.entrypoint as string) === MultiTypeInputType.RUNTIME && (
        <MultiTypeListInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.entrypoint`}
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{ dataTooltipId: 'dependencyEntryPoint' }}
              >
                {getString('entryPointLabel')}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.args as string) === MultiTypeInputType.RUNTIME && (
        <MultiTypeListInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.args`}
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{ dataTooltipId: 'dependencyArgs' }}
              >
                {getString('argsLabel')}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} withoutTimeout />
    </FormikForm>
  )
}
