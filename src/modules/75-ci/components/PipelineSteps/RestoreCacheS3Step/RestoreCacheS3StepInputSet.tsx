import React from 'react'
import { Text, FormInput, Button, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import type { RestoreCacheS3StepProps } from './RestoreCacheS3Step'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RestoreCacheS3StepInputSet: React.FC<RestoreCacheS3StepProps> = ({ template, path, readonly }) => {
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const archiveFormatOptions = [
    { label: 'tar', value: 'tar' },
    { label: 'gzip', value: 'gzip' }
  ]

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormConnectorReferenceField
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.awsConnectorLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.restoreCacheAwsConnectorInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          type={'Aws'}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={560}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.connectorRef`}
          placeholder={getString('select')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.region) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.region`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('regionLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.regionInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          placeholder={getString('pipelineSteps.regionPlaceholder')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.bucket`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.bucketLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.S3BucketInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.key) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
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
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.archiveFormat) === MultiTypeInputType.RUNTIME && (
        <FormInput.Select
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.archiveFormat`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('archiveFormat')}
              <Button icon="question" minimal tooltip={getString('archiveFormatInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          items={archiveFormatOptions}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.pathStyle) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          className={css.checkbox}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.pathStyle`}
          label={getString('pathStyle')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.failIfKeyNotFound) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${isEmpty(path) ? '' : `${path}.`}spec.failIfKeyNotFound`}
          label={getString('failIfKeyNotFound')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
