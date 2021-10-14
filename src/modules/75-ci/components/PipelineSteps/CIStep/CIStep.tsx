import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { FormInput, Text, getMultiTypeFromValue, MultiTypeInputType, Container } from '@wings-software/uicore'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { useGitScope } from '@ci/services/CIUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface CIStepProps {
  isNewStep?: boolean
  readonly?: boolean
  stepLabel?: string
  expressions?: string[]
  enableFields: {
    [key: string]: { [key: string]: any }
  }
  formik: FormikProps<any>
}

export const CIStep: React.FC<CIStepProps> = props => {
  const { isNewStep, readonly, stepLabel, expressions, enableFields, formik } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { getString } = useStrings()
  const gitScope = useGitScope()
  return (
    <>
      <Container className={cx(css.formGroup, css.lg)} margin={{ bottom: 'small' }}>
        <FormInput.InputWithIdentifier
          inputName="name"
          idName="identifier"
          isIdentifierEditable={isNewStep}
          inputLabel={stepLabel ?? getString('pipelineSteps.stepNameLabel')}
          inputGroupProps={{ disabled: readonly }}
        />
      </Container>
      {Object.prototype.hasOwnProperty.call(enableFields, 'description') ? (
        <FormMultiTypeTextAreaField
          className={css.removeBpLabelMargin}
          name="description"
          label={<Text margin={{ bottom: 'xsmall' }}>{getString('description')}</Text>}
          multiTypeTextArea={{ expressions, disabled: readonly }}
          style={{ marginBottom: 'var(--spacing-medium)' }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.connectorRef') ? (
        <FormMultiTypeConnectorField
          label={enableFields['spec.connectorRef'].label}
          type={enableFields['spec.connectorRef'].type}
          width={getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560}
          name="spec.connectorRef"
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, disabled: readonly }}
          gitScope={gitScope}
          style={{ marginBottom: 'var(--spacing-xsmall)' }}
          setRefValue
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.image') ? (
        <MultiTypeTextField
          name="spec.image"
          label={
            <Text
              margin={{ top: 'small' }}
              tooltipProps={{
                dataTooltipId: enableFields['spec.image'].tooltipId
              }}
            >
              {getString('imageLabel')}
            </Text>
          }
          multiTextInputProps={enableFields['spec.image'].multiTextInputProps}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.target') ? (
        <MultiTypeTextField
          name="spec.target"
          label={
            <Text tooltipProps={{ dataTooltipId: enableFields['spec.target'].tooltipId }}>
              {getString('pipelineSteps.targetLabel')}
            </Text>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.repo') ? (
        <MultiTypeTextField
          name="spec.repo"
          label={
            <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'dockerHubRepository' }}>
              {getString('connectors.docker.dockerRepository')}
            </Text>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.host') ? (
        <MultiTypeTextField
          name="spec.host"
          label={
            <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'gcrHost' }}>
              {getString('pipelineSteps.hostLabel')}
            </Text>
          }
          multiTextInputProps={{
            placeholder: getString('pipelineSteps.hostPlaceholder'),
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.projectID') ? (
        <MultiTypeTextField
          name="spec.projectID"
          label={
            <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'gcrProjectID' }}>
              {getString('pipelineSteps.projectIDLabel')}
            </Text>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.region') ? (
        <MultiTypeTextField
          name="spec.region"
          label={
            <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'region' }}>
              {getString('regionLabel')}
            </Text>
          }
          multiTextInputProps={{
            placeholder: getString('pipelineSteps.regionPlaceholder'),
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.bucket') ? (
        <MultiTypeTextField
          name="spec.bucket"
          label={
            <Text tooltipProps={{ dataTooltipId: enableFields['spec.bucket'].tooltipId }}>
              {getString('pipelineSteps.bucketLabel')}
            </Text>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.key') ? (
        <MultiTypeTextField
          name="spec.key"
          label={
            <Text tooltipProps={{ dataTooltipId: enableFields['spec.key'].tooltipId }}>{getString('keyLabel')}</Text>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.sourcePaths') ? (
        <MultiTypeList
          name="spec.sourcePaths"
          multiTextInputProps={{ expressions }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{ dataTooltipId: 'saveCacheSourcePaths' }}
              >
                {getString('pipelineSteps.sourcePathsLabel')}
              </Text>
            )
          }}
          disabled={readonly}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.sourcePath') ? (
        <MultiTypeTextField
          name="spec.sourcePath"
          label={
            <Text tooltipProps={{ dataTooltipId: 'sourcePath' }}>{getString('pipelineSteps.sourcePathLabel')}</Text>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.account') ? (
        <MultiTypeTextField
          name="spec.account"
          label={
            <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'ecrAccount' }}>
              {getString('common.accountId')}
            </Text>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.imageName') ? (
        <MultiTypeTextField
          name="spec.imageName"
          label={
            <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'imageName' }}>
              {getString('imageNameLabel')}
            </Text>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
        />
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.tags') ? (
        <MultiTypeList
          name="spec.tags"
          multiTextInputProps={{ expressions }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'tags' }}>
                {getString('tagsLabel')}
              </Text>
            )
          }}
          style={{ marginTop: 'var(--spacing-xsmall)' }}
          disabled={readonly}
        />
      ) : null}
    </>
  )
}
