import React from 'react'
import isEmpty from 'lodash/isEmpty'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { FormInput, Text, Container, Color, MultiTypeInputType } from '@wings-software/uicore'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { FormMultiTypeTextAreaField } from '@common/components'
import { Separator } from '@common/components/Separator/Separator'
import { useGitScope } from '@ci/services/CIUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface CIStepProps {
  isNewStep?: boolean
  readonly?: boolean
  stepLabel?: string
  enableFields: {
    [key: string]: { [key: string]: any }
  }
  formik?: FormikProps<any>
  stepViewType: StepViewType
  allowableTypes: MultiTypeInputType[]
  path?: string
}

export const CIStep: React.FC<CIStepProps> = props => {
  const { isNewStep, readonly, stepLabel, enableFields, stepViewType, allowableTypes, path } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { getString } = useStrings()
  const gitScope = useGitScope()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg

  return (
    <>
      {stepViewType !== StepViewType.Template && Object.prototype.hasOwnProperty.call(enableFields, 'name') ? (
        <Container className={cx(css.formGroup, stepCss, css.nameIdLabel)}>
          <FormInput.InputWithIdentifier
            inputName="name"
            idName="identifier"
            isIdentifierEditable={isNewStep && !readonly}
            inputGroupProps={{ disabled: readonly }}
            inputLabel={stepLabel ?? getString('pipelineSteps.stepNameLabel')}
          />
        </Container>
      ) : null}
      <Container className={cx(css.formGroup, stepCss)}>
        {Object.prototype.hasOwnProperty.call(enableFields, 'description') ? (
          <FormMultiTypeTextAreaField
            name={`${prefix}description`}
            label={
              <Text color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                {getString('description')}
              </Text>
            }
            multiTypeTextArea={{ expressions, allowableTypes, disabled: readonly }}
          />
        ) : null}
      </Container>
      <Separator topSeparation={8} />
      <Container className={css.bottomMargin3}>
        {Object.prototype.hasOwnProperty.call(enableFields, 'spec.connectorRef') ? (
          <FormMultiTypeConnectorField
            label={enableFields['spec.connectorRef'].label}
            type={enableFields['spec.connectorRef'].type}
            width={
              stepViewType === StepViewType.DeploymentForm ? 320 : stepViewType === StepViewType.InputSet ? 310 : 385
            }
            name={`${prefix}spec.connectorRef`}
            placeholder={getString('select')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{
              expressions,
              allowableTypes,
              disabled: readonly,
              ...enableFields['spec.connectorRef'].multiTypeProps
            }}
            gitScope={gitScope}
            setRefValue
          />
        ) : null}
      </Container>
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.image') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.image`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{
                  dataTooltipId: enableFields['spec.image'].tooltipId
                }}
              >
                {getString('imageLabel')}
              </Text>
            }
            multiTextInputProps={enableFields['spec.image'].multiTextInputProps}
            style={{ padding: 0, margin: 0 }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.target') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.target`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: enableFields['spec.target'].tooltipId }}
              >
                {getString('pipelineSteps.targetLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.repo') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.repo`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'dockerHubRepository' }}
              >
                {getString('connectors.docker.dockerRepository')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.host') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.host`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'gcrHost' }}
              >
                {getString('pipelineSteps.hostLabel')}
              </Text>
            }
            multiTextInputProps={{
              placeholder: getString('pipelineSteps.hostPlaceholder'),
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.projectID') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.projectID`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'gcrProjectID' }}
              >
                {getString('pipelineSteps.projectIDLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.region') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.region`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'region' }}
              >
                {getString('regionLabel')}
              </Text>
            }
            multiTextInputProps={{
              placeholder: getString('pipelineSteps.regionPlaceholder'),
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.bucket') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.bucket`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: enableFields['spec.bucket'].tooltipId }}
              >
                {getString('pipelineSteps.bucketLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.key') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.key`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: enableFields['spec.key'].tooltipId }}
              >
                {getString('keyLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.sourcePaths') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeList
            name={`${prefix}spec.sourcePaths`}
            multiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'saveCacheSourcePaths' }}
                >
                  {getString('pipelineSteps.sourcePathsLabel')}
                </Text>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.sourcePath') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.sourcePath`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'sourcePath' }}
              >
                {getString('pipelineSteps.sourcePathLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.account') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.account`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'ecrAccount' }}
              >
                {getString('common.accountId')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.imageName') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`${prefix}spec.imageName`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'imageName' }}
              >
                {getString('imageNameLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.tags') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeList
            name={`${prefix}spec.tags`}
            multiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'tags' }}
                >
                  {getString('tagsLabel')}
                </Text>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
    </>
  )
}
