import React from 'react'
import {
  Text,
  Formik,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext, getStageFromPipeline } from '@pipeline/exports'
import { useStrings } from 'framework/exports'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import StepCommonFields /*,{ /*usePullOptions }*/ from '@pipeline/components/StepCommonFields/StepCommonFields'
import { getInitialValuesInCorrectFormat, getFormValuesInCorrectFormat } from '../StepsTransformValuesUtils'
import { validate } from '../StepsValidateUtils'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './DockerHubStepFunctionConfigs'
import type { DockerHubStepProps, DockerHubStepData, DockerHubStepDataUI } from './DockerHubStep'
import css from '../Steps.module.scss'

export const DockerHubStepBase = (
  { initialValues, onUpdate }: DockerHubStepProps,
  formikRef: StepFormikFowardRef<DockerHubStepData>
): JSX.Element => {
  const {
    state: { pipeline, pipelineView },
    updatePipelineView
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { stage: currentStage } = getStageFromPipeline(pipeline, pipelineView.splitViewData.selectedStageId || '')

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<DockerHubStepData, DockerHubStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  const handleCancelClick = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: { type: DrawerTypes.StepConfig }
    })
  }

  return (
    <>
      <Text className={css.boldLabel} font={{ size: 'medium' }}>
        {getString('pipelineSteps.dockerHub.title')}
      </Text>
      <Formik
        initialValues={getInitialValuesInCorrectFormat<DockerHubStepData, DockerHubStepDataUI>(
          initialValues,
          transformValuesFieldsConfig
        )}
        validate={valuesToValidate => {
          return validate(valuesToValidate, editViewValidateFieldsConfig, {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          })
        }}
        onSubmit={(_values: DockerHubStepDataUI) => {
          const schemaValues = getFormValuesInCorrectFormat<DockerHubStepDataUI, DockerHubStepData>(
            _values,
            transformValuesFieldsConfig
          )
          onUpdate?.(schemaValues)
        }}
      >
        {(formik: FormikProps<DockerHubStepData>) => {
          // This is required
          setFormikRef?.(formikRef, formik)

          return (
            <FormikForm>
              <div className={css.fieldsSection}>
                <FormInput.InputWithIdentifier
                  inputName="name"
                  idName="identifier"
                  isIdentifierEditable={isEmpty(initialValues.identifier)}
                  inputLabel={getString('pipelineSteps.stepNameLabel')}
                />
                <FormMultiTypeConnectorField
                  label={
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      {getString('pipelineSteps.dockerHubConnectorLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.dockerHubConnectorInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  }
                  type={'DockerRegistry'}
                  width={
                    getMultiTypeFromValue(formik?.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560
                  }
                  name="spec.connectorRef"
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  style={{ marginBottom: 0 }}
                />
                <MultiTypeTextField
                  name="spec.repo"
                  label={
                    <Text margin={{ top: 'small' }}>
                      {getString('dockerRegistry')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.dockerRegistryInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  }
                />
                <MultiTypeList
                  name="spec.tags"
                  multiTypeFieldSelectorProps={{
                    label: (
                      <Text style={{ display: 'flex', alignItems: 'center' }}>
                        {getString('tagsLabel')}
                        <Button icon="question" minimal tooltip={getString('tagsInfo')} iconProps={{ size: 14 }} />
                      </Text>
                    )
                  }}
                  style={{ marginTop: 'var(--spacing-xsmall)' }}
                />
              </div>
              <div className={css.fieldsSection}>
                <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
                  {getString('pipelineSteps.optionalConfiguration')}
                </Text>
                <MultiTypeTextField
                  name="spec.dockerfile"
                  label={
                    <Text margin={{ top: 'small' }}>
                      {getString('pipelineSteps.dockerfileLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.dockerfileInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  }
                />
                <MultiTypeTextField
                  name="spec.context"
                  label={
                    <Text margin={{ top: 'small' }}>
                      {getString('pipelineSteps.contextLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.contextInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  }
                />
                <MultiTypeMap
                  name="spec.labels"
                  multiTypeFieldSelectorProps={{
                    label: (
                      <Text style={{ display: 'flex', alignItems: 'center' }}>
                        {getString('pipelineSteps.labelsLabel')}
                        <Button
                          icon="question"
                          minimal
                          tooltip={getString('pipelineSteps.labelsInfo')}
                          iconProps={{ size: 14 }}
                        />
                      </Text>
                    )
                  }}
                  style={{ marginTop: 'var(--spacing-xsmall)', marginBottom: 'var(--spacing-small)' }}
                />
                <MultiTypeMap
                  name="spec.buildArgs"
                  multiTypeFieldSelectorProps={{
                    label: (
                      <Text style={{ display: 'flex', alignItems: 'center' }}>
                        {getString('pipelineSteps.buildArgsLabel')}
                        <Button
                          icon="question"
                          minimal
                          tooltip={getString('pipelineSteps.buildArgsInfo')}
                          iconProps={{ size: 14 }}
                        />
                      </Text>
                    )
                  }}
                />
                <MultiTypeTextField
                  name="spec.target"
                  label={
                    <Text margin={{ top: 'small' }}>
                      {getString('pipelineSteps.targetLabel')}
                      <Button
                        icon="question"
                        minimal
                        tooltip={getString('pipelineSteps.targetInfo')}
                        iconProps={{ size: 14 }}
                      />
                    </Text>
                  }
                />
                <StepCommonFields />
              </div>
              <div className={css.buttonsWrapper}>
                <Button
                  intent="primary"
                  type="submit"
                  text={getString('save')}
                  margin={{ right: 'xxlarge' }}
                  data-testid={'submit'}
                />
                <Button text={getString('cancel')} minimal onClick={handleCancelClick} />
              </div>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const DockerHubStepBaseWithRef = React.forwardRef(DockerHubStepBase)
