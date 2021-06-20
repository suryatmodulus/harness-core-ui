import React from 'react'
import { Text, Button, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { RestoreCacheGCSStepProps } from './RestoreCacheGCSStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RestoreCacheGCSStepInputSet: React.FC<RestoreCacheGCSStepProps> = ({ template, path, readonly }) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const { accountId, projectIdentifier, orgIdentifier, repoIdentifier: repo = '', branch } = useParams<
    {
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    } & GitQueryParams
  >()

  const archiveFormatOptions = [
    { label: 'tar', value: 'tar' },
    { label: 'gzip', value: 'gzip' }
  ]

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.gcpConnectorLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.restoreCacheGcpConnectorInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          type={'Gcp'}
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
      {getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.bucket`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.bucketLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.GCSBucketInfo')}
                iconProps={{ size: 14 }}
              />
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
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('keyLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.restoreCacheKeyInfo')}
                iconProps={{ size: 14 }}
              />
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
      {getMultiTypeFromValue(template?.spec?.archiveFormat) === MultiTypeInputType.RUNTIME && (
        <MultiTypeSelectField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.archiveFormat`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('archiveFormat')}
              <Button icon="question" minimal tooltip={getString('archiveFormatInfo')} iconProps={{ size: 14 }} />
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
      {getMultiTypeFromValue(template?.spec?.failIfKeyNotFound) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeCheckboxField
          name={`${isEmpty(path) ? '' : `${path}.`}spec.failIfKeyNotFound`}
          label={getString('failIfKeyNotFound')}
          multiTypeTextbox={{
            children: (
              <Button
                icon="question"
                minimal
                tooltip={getString('ci.pipelineSteps.failIfKeyNotFoundInfo')}
                iconProps={{ size: 14 }}
              />
            ),
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            disabled: readonly
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
