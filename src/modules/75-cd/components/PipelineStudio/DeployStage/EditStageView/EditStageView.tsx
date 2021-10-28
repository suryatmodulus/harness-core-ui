import React from 'react'
import {
  Text,
  Container,
  Formik,
  FormikForm,
  Button,
  Card,
  Accordion,
  HarnessDocTooltip,
  ThumbnailSelect,
  Color,
  ButtonVariation,
  MultiTypeInputType
} from '@wings-software/uicore'
import type { Item } from '@wings-software/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import cx from 'classnames'
import * as Yup from 'yup'
import produce from 'immer'
import { omit, set } from 'lodash-es'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { AllNGVariables } from '@pipeline/utils/types'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { StringNGVariable } from 'services/cd-ng'
import css from './EditStageView.module.scss'
import stageCss from '../../DeployStageSetupShell/DeployStage.module.scss'

export interface EditStageViewProps {
  data?: StageElementWrapper<DeploymentStageElementConfig>
  onSubmit?: (values: StageElementWrapper<DeploymentStageElementConfig>, identifier?: string) => void
  onChange?: (values: DeploymentStageElementConfig) => void
  context?: string
  isReadonly: boolean
}

export const EditStageView: React.FC<EditStageViewProps> = ({
  data,
  onSubmit,
  context,
  onChange,
  isReadonly,
  children
}): JSX.Element => {
  const {
    state: {
      pipeline: { stages = [] }
    }
  } = usePipelineContext()
  const { getString } = useStrings()
  const newStageData: Item[] = [
    {
      label: getString('service'),
      value: 'service',
      icon: 'service',
      disabled: false
    },
    {
      label: getString('multipleService'),
      value: 'multiple-service',
      icon: 'multi-service',
      disabled: true
    },
    {
      label: getString('functions'),
      value: 'functions',
      icon: 'functions',
      disabled: true
    },
    {
      label: getString('otherWorkloads'),
      value: 'other-workloads',
      icon: 'other-workload',
      disabled: true
    }
  ]
  const { stepsFactory, getStageFromPipeline } = usePipelineContext()
  const { variablesPipeline, metadataMap } = usePipelineVariables()
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const allNGVariables = (data?.stage?.variables || []) as AllNGVariables[]
  const { errorMap } = useValidationErrors()
  const { subscribeForm, unSubscribeForm, submitFormsForTab } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.OVERVIEW)
    }
  }, [errorMap])

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.OVERVIEW, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.OVERVIEW, form: formikRef })
  }, [])

  const whatToDeploy = (
    <>
      {context ? (
        <div className={stageCss.tabSubHeading}>{getString('whatToDeploy')}</div>
      ) : (
        <Text
          color={Color.GREY_700}
          font={{ size: 'normal', weight: 'semi-bold' }}
          tooltipProps={{ dataTooltipId: 'whatToDeploy' }}
        >
          {getString('whatToDeploy')}
        </Text>
      )}

      <ThumbnailSelect
        name="serviceType"
        items={newStageData}
        className={context ? stageCss.thumbnailSelect : css.stageTypeThumbnail}
        isReadonly={isReadonly}
      />
    </>
  )

  return (
    <div className={stageCss.serviceOverrides}>
      <DeployServiceErrors />
      <div className={context ? stageCss.contentSection : css.contentSection} ref={scrollRef}>
        {context ? (
          <div className={stageCss.tabHeading} id="stageOverview">
            {getString('stageOverview')}
          </div>
        ) : (
          <Text icon="cd-main" iconProps={{ size: 16 }} className={css.addStageHeading}>
            {getString('pipelineSteps.build.create.aboutYourStage')}
          </Text>
        )}
        <Container>
          <Formik
            initialValues={{
              identifier: data?.stage?.identifier,
              name: data?.stage?.name,
              description: data?.stage?.description,
              tags: data?.stage?.tags || {},
              serviceType: newStageData[0].value
            }}
            formName="cdEditStage"
            onSubmit={values => {
              if (data) {
                const newData = produce(data, draft => {
                  if (draft.stage) {
                    set(draft, 'stage.identifier', values.identifier)
                    set(draft, 'stage.name', values.name)
                    set(draft, 'stage.description', values.description)
                    set(draft, 'stage.tags', values.tags || {})

                    if (!draft.stage.spec?.serviceConfig) {
                      set(draft, 'stage.spec.serviceConfig', {})
                    }

                    if (!draft.stage.spec?.infrastructure) {
                      set(draft, 'stage.spec.infrastructure', {})
                    }
                  }
                })

                onSubmit?.(newData, values.identifier)
              }
            }}
            validate={values => {
              const errors: { name?: string } = {}
              if (isDuplicateStageId(values.identifier || '', stages, !!context)) {
                errors.name = getString('validation.identifierDuplicate')
              }
              if (context && data) {
                onChange?.(omit(values as unknown as DeploymentStageElementConfig, 'serviceType'))
              }
              return errors
            }}
            validationSchema={Yup.object().shape({
              name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.build.create.stageNameRequiredError') }),
              identifier: IdentifierSchema()
            })}
          >
            {formikProps => {
              window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.OVERVIEW }))
              formikRef.current = formikProps
              return (
                <FormikForm>
                  {context ? (
                    <Card className={stageCss.sectionCard}>
                      <NameIdDescriptionTags
                        formikProps={formikProps}
                        identifierProps={{
                          inputLabel: getString('stageNameLabel'),
                          isIdentifierEditable: !context,
                          inputGroupProps: { disabled: isReadonly }
                        }}
                        descriptionProps={{ disabled: isReadonly }}
                        tagsProps={{ disabled: isReadonly }}
                        className={css.nameIdDescriptionTags}
                      />
                    </Card>
                  ) : (
                    <NameIdDescriptionTags
                      formikProps={formikProps}
                      identifierProps={{
                        inputLabel: getString('stageNameLabel'),
                        isIdentifierEditable: !context && !isReadonly,
                        inputGroupProps: { disabled: isReadonly }
                      }}
                      descriptionProps={{ disabled: isReadonly }}
                      tagsProps={{ disabled: isReadonly }}
                    />
                  )}

                  {!context ? whatToDeploy : <Card className={stageCss.sectionCard}>{whatToDeploy}</Card>}

                  {!context && (
                    <Button
                      margin={{ top: 'medium' }}
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={getString('pipelineSteps.build.create.setupStage')}
                    />
                  )}
                </FormikForm>
              )
            }}
          </Formik>
        </Container>
        {context && (
          <>
            <Accordion activeId={allNGVariables.length > 0 ? 'advanced' : ''} className={stageCss.accordion}>
              <Accordion.Panel
                id="advanced"
                addDomId={true}
                summary={<div className={stageCss.tabHeading}>{getString('common.advanced')}</div>}
                details={
                  <Card className={stageCss.sectionCard} id="variables">
                    <div
                      className={cx(stageCss.tabSubHeading, 'ng-tooltip-native')}
                      data-tooltip-id="overviewStageVariables"
                    >
                      {getString('pipeline.stageVariables')}
                      <HarnessDocTooltip tooltipId="overviewStageVariables" useStandAlone={true} />
                    </div>
                    <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                      factory={stepsFactory}
                      initialValues={{
                        variables: allNGVariables,
                        canAddVariable: true
                      }}
                      readonly={isReadonly}
                      type={StepType.CustomVariable}
                      stepViewType={StepViewType.StageVariable}
                      allowableTypes={[
                        MultiTypeInputType.FIXED,
                        MultiTypeInputType.RUNTIME,
                        MultiTypeInputType.EXPRESSION
                      ]}
                      onUpdate={({ variables }: CustomVariablesData) => {
                        onChange?.({ ...(data?.stage as DeploymentStageElementConfig), variables })
                      }}
                      customStepProps={{
                        tabName: DeployTabs.OVERVIEW,
                        yamlProperties:
                          getStageFromPipeline(
                            data?.stage?.identifier || '',
                            variablesPipeline
                          )?.stage?.stage?.variables?.map?.(
                            variable => metadataMap[(variable as StringNGVariable).value || '']?.yamlProperties || {}
                          ) || [],
                        enableValidation: true
                      }}
                    />
                  </Card>
                }
              />
            </Accordion>
            <Container margin={{ top: 'xxlarge' }}>{children}</Container>
          </>
        )}
      </div>
    </div>
  )
}
