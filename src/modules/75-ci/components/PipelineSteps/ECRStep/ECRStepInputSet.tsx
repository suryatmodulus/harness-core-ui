import React from 'react'
import { connect } from 'formik'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { ECRStepProps } from './ECRStep'
import { shouldRenderRunTimeInputView } from '../CIStep/StepUtils'
import { ArtifactoryInputSetCommonField } from '../CIStep/ArtifactoryInputSetCommonField'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const ECRStepInputSetBasic: React.FC<ECRStepProps> = ({
  template,
  path,
  readonly,
  stepViewType,
  allowableTypes,
  formik
}) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const {
    accountId,
    projectIdentifier,
    orgIdentifier,
    branch,
    repoIdentifier = ''
  } = useParams<
    {
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    } & GitQueryParams
  >()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin} style={{ width: '50%' }}>
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'ecrConnector' }}>
              {getString('pipelineSteps.awsConnectorLabel')}
            </Text>
          }
          type={'Aws'}
          setRefValue
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={stepViewType === StepViewType.DeploymentForm ? 391 : 455}
          gitScope={{ branch, repo: repoIdentifier, getDefaultFromOtherRepo: true }}
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
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.account) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.account`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'ecrAccount' }}>
              {getString('common.accountId')}
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
      {getMultiTypeFromValue(template?.spec?.imageName) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.imageName`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'imageName' }}>
              {getString('imageNameLabel')}
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
      {shouldRenderRunTimeInputView(template?.spec?.tags) && (
        <MultiTypeListInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.tags`}
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'tags' }}>
                {getString('tagsLabel')}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      <ArtifactoryInputSetCommonField template={template} path={path} readonly={readonly} formik={formik} />
      {getMultiTypeFromValue(template?.spec?.remoteCacheImage) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.remoteCacheImage`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'ecrRemoteCache' }}>
              {getString('ci.remoteCacheImage.label')}
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
      <StepCommonFieldsInputSet
        path={path}
        readonly={readonly}
        template={template}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
      />
    </FormikForm>
  )
}

const ECRStepInputSet = connect(ECRStepInputSetBasic)
export { ECRStepInputSet }
