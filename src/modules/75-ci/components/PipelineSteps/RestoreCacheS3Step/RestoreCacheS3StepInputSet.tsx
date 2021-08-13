import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { RestoreCacheS3StepProps } from './RestoreCacheS3Step'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RestoreCacheS3StepInputSet: React.FC<RestoreCacheS3StepProps> = ({ template, path, readonly }) => {
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

  const archiveFormatOptions = [
    { label: 'Tar', value: 'Tar' },
    { label: 'Gzip', value: 'Gzip' }
  ]

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          label={
            <Text
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{ dataTooltipId: 'restoreCacheAwsConnector' }}
            >
              {getString('pipelineSteps.awsConnectorLabel')}
            </Text>
          }
          type={'Aws'}
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
      {getMultiTypeFromValue(template?.spec?.region) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.region`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'region' }}>
              {getString('regionLabel')}
            </Text>
          }
          multiTextInputProps={{
            placeholder: getString('pipelineSteps.regionPlaceholder'),
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.bucket`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 's3Bucket' }}>
              {getString('pipelineSteps.bucketLabel')}
            </Text>
          }
          multiTextInputProps={{
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.key) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.key`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'restoreCacheKey' }}>
              {getString('keyLabel')}
            </Text>
          }
          multiTextInputProps={{
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.endpoint) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          name={`${isEmpty(path) ? '' : `${path}.`}spec.endpoint`}
          label={<Text tooltipProps={{ dataTooltipId: 'endpoint' }}>{getString('pipelineSteps.endpointLabel')}</Text>}
          multiTextInputProps={{
            placeholder: getString('pipelineSteps.endpointPlaceholder'),
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.archiveFormat) === MultiTypeInputType.RUNTIME && (
        <MultiTypeSelectField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.archiveFormat`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'archiveFormat' }}>
              {getString('archiveFormat')}
            </Text>
          }
          multiTypeInputProps={{
            selectItems: archiveFormatOptions,
            multiTypeInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.pathStyle) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeCheckboxField
          name={`${isEmpty(path) ? '' : `${path}.`}spec.pathStyle`}
          label={getString('pathStyle')}
          disabled={readonly}
          multiTypeTextbox={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
          setToFalseWhenEmpty={true}
          tooltipProps={{ dataTooltipId: 'pathStyle' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.failIfKeyNotFound) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeCheckboxField
          name={`${isEmpty(path) ? '' : `${path}.`}spec.failIfKeyNotFound`}
          label={getString('failIfKeyNotFound')}
          disabled={readonly}
          multiTypeTextbox={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
          setToFalseWhenEmpty={true}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
