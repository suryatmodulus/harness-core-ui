import React from 'react'
import { Text, FormInput, Button, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import Map from '@common/components/Map/Map'
import List from '@common/components/List/List'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import type { ECRStepProps } from './ECRStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const ECRStepInputSet: React.FC<ECRStepProps> = ({ template, path, readonly }) => {
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
              {getString('pipelineSteps.awsConnectorLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.ecrConnectorInfo')}
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
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.account) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.account`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.accountLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.accountInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.imageName) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.imageName`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('imageNameLabel')}
              <Button icon="question" minimal tooltip={getString('imageNameInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.tags as string) === MultiTypeInputType.RUNTIME && (
        <List
          name={`${isEmpty(path) ? '' : `${path}.`}spec.tags`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('tagsLabel')}
              <Button icon="question" minimal tooltip={getString('tagsInfo')} iconProps={{ size: 14 }} />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.dockerfile) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.dockerfile`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.dockerfileLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.dockerfileInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.context) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.context`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.contextLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.contextInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.labels as string) === MultiTypeInputType.RUNTIME && (
        <Map
          name={`${isEmpty(path) ? '' : `${path}.`}spec.labels`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.labelsLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.labelsInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.buildArgs as string) === MultiTypeInputType.RUNTIME && (
        <Map
          name={`${isEmpty(path) ? '' : `${path}.`}spec.buildArgs`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.buildArgsLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.buildArgsInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.optimize) === MultiTypeInputType.RUNTIME && (
        <FormInput.CheckBox
          name={`${isEmpty(path) ? '' : `${path}.`}spec.optimize`}
          label={getString('ci.optimize')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.target) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.target`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('pipelineSteps.targetLabel')}
              <Button
                icon="question"
                minimal
                tooltip={getString('pipelineSteps.targetInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.remoteCacheImage) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.remoteCacheImage`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('ci.remoteCacheImage.label')}
              <Button
                icon="question"
                minimal
                tooltip={getString('ci.remoteCacheImage.ecrInfo')}
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
