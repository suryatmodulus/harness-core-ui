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
  Color
} from '@wings-software/uicore'
import type { Item } from '@wings-software/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import cx from 'classnames'
import * as Yup from 'yup'
import produce from 'immer'
import { omit, set } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { StageElementWrapper, StageElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  usePipelineContext,
  PipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { AllNGVariables } from '@pipeline/utils/types'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import css from './EditStageView.module.scss'

export interface EditStageView {
  data?: StageElementWrapper
  onSubmit?: (values: StageElementWrapper, identifier: string) => void
  onChange?: (values: StageElementWrapper) => void
  context?: string
  isReadonly: boolean
}

export const EditStageView: React.FC<EditStageView> = ({
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
  } = React.useContext(PipelineContext)
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
  const allNGVariables = ((data?.stage as StageElementConfig)?.variables || []) as AllNGVariables[]
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
      <Text color={Color.BLACK_100} font={{ size: 'normal' }} tooltipProps={{ dataTooltipId: 'whatToDeploy' }}>
        {getString('whatToDeploy')}
      </Text>
      <ThumbnailSelect
        name="serviceType"
        items={newStageData}
        className={css.stageTypeThumbnail}
        isReadonly={isReadonly}
      />
    </>
  )

  return (
    <>
      <DeployServiceErrors />
      <div className={cx({ [css.contentSection]: context })} ref={scrollRef}>
        <div className={cx({ [css.stageCreate]: true, [css.stageDetails]: !!context, [css.padding]: !context })}>
          {context ? (
            <div className={css.tabHeading} id="stageOverview">
              {getString('stageOverview')}
            </div>
          ) : (
            <Text icon="cd-main" iconProps={{ size: 16 }} style={{ paddingBottom: 'var(--spacing-medium)' }}>
              {getString('pipelineSteps.build.create.aboutYourStage')}
            </Text>
          )}
          <Container>
            <Formik
              initialValues={{
                identifier: data?.stage.identifier,
                name: data?.stage.name,
                description: data?.stage.description,
                tags: data?.stage?.tags || {},
                serviceType: newStageData[0].value
              }}
              formName="cdEditStage"
              onSubmit={values => {
                if (data) {
                  const newData = produce(data, draft => {
                    if (draft.stage) {
                      draft.stage.identifier = values.identifier
                      draft.stage.name = values.name
                      draft.stage.description = values.description
                      draft.stage.tags = values.tags || {}

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
                if (isDuplicateStageId(values.identifier, stages, !!context)) {
                  errors.name = getString('validation.identifierDuplicate')
                }
                if (context && data) {
                  onChange?.(omit(values, 'serviceType'))
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
                      <Card className={cx(css.sectionCard, css.shadow)}>
                        <NameIdDescriptionTags
                          formikProps={formikProps}
                          identifierProps={{
                            isIdentifierEditable: !context,
                            inputGroupProps: { disabled: isReadonly }
                          }}
                          descriptionProps={{ disabled: isReadonly }}
                          tagsProps={{ disabled: isReadonly }}
                        />
                      </Card>
                    ) : (
                      <NameIdDescriptionTags
                        formikProps={formikProps}
                        identifierProps={{
                          isIdentifierEditable: !context && !isReadonly,
                          inputGroupProps: { disabled: isReadonly }
                        }}
                        descriptionProps={{ disabled: isReadonly }}
                        tagsProps={{ disabled: isReadonly }}
                      />
                    )}

                    {!context ? whatToDeploy : <Card className={cx(css.sectionCard, css.shadow)}>{whatToDeploy}</Card>}

                    {!context && (
                      <div className={css.btnSetup}>
                        <Button
                          type="submit"
                          intent="primary"
                          text={getString('pipelineSteps.build.create.setupStage')}
                        />
                      </div>
                    )}
                  </FormikForm>
                )
              }}
            </Formik>
          </Container>
        </div>
        {context && (
          <Accordion activeId={allNGVariables.length > 0 ? 'advanced' : ''} className={css.accordionTitle}>
            <Accordion.Panel
              id="advanced"
              addDomId={true}
              summary={getString('common.advanced')}
              details={
                <Card className={cx(css.sectionCard, css.shadow)} id="variables">
                  <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id="overviewStageVariables">
                    Stage Variables
                    <HarnessDocTooltip tooltipId="overviewStageVariables" useStandAlone={true} />
                  </div>
                  <div className={css.stageSection}>
                    <div className={cx(css.stageDetails)}>
                      {context ? (
                        <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                          factory={stepsFactory}
                          initialValues={{
                            variables: allNGVariables,
                            canAddVariable: true
                          }}
                          readonly={isReadonly}
                          type={StepType.CustomVariable}
                          stepViewType={StepViewType.StageVariable}
                          onUpdate={({ variables }: CustomVariablesData) => {
                            onChange?.({ ...data?.stage, variables } as StageElementConfig)
                          }}
                          customStepProps={{
                            tabName: DeployTabs.OVERVIEW,
                            yamlProperties:
                              getStageFromPipeline(
                                data?.stage?.identifier,
                                variablesPipeline
                              )?.stage?.stage?.variables?.map?.(
                                (variable: AllNGVariables) => metadataMap[variable.value || '']?.yamlProperties || {}
                              ) || [],
                            enableValidation: true
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </Card>
              }
            />
          </Accordion>
        )}
        <div className={cx(css.navigationButtons, { [css.createModal]: !context })}>{children}</div>
      </div>
    </>
  )
}
