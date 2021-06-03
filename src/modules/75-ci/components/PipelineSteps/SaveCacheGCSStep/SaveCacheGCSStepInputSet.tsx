import React from 'react'
import { Text, FormInput, Button, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import List from '@common/components/List/List'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import type { SaveCacheGCSStepProps } from './SaveCacheGCSStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SaveCacheGCSStepInputSet: React.FC<SaveCacheGCSStepProps> = ({ template, path, readonly }) => {
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
              {getString('pipelineSteps.gcpConnectorLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.gcpConnectorInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          type={'Gcp'}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={560}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.connectorRef`}
          placeholder={getString('select')}
          disabled={readonly}
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
                tooltip={getString('pipelineSteps.GCSBucketInfo')}
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
              <Button icon="question" minimal tooltip={getString('pipelineSteps.keyInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.sourcePaths as string) === MultiTypeInputType.RUNTIME && (
        <List
          name={`${isEmpty(path) ? '' : `${path}.`}spec.sourcePaths`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.sourcePathsLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.cacheSourcePathsInfo')}
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
      {getMultiTypeFromValue(template?.spec?.override) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          className={css.checkbox}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.override`}
          label={getString('override')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
