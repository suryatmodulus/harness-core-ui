import React, { useCallback, useRef } from 'react'
import cx from 'classnames'
import { Formik } from 'formik'
import { cloneDeep, debounce } from 'lodash-es'
import { Accordion, Card, Container, FormikForm, Layout } from '@wings-software/uicore'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { StageElementConfig, StageElementWrapper } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { ApprovalStageOverviewProps } from './types'
import css from './ApprovalStageOverview.module.scss'

export const ApprovalStageOverview: React.FC<ApprovalStageOverviewProps> = props => {
  const {
    state: {
      pipeline: { stages = [] },
      selectionState: { selectedStageId }
    },
    stepsFactory,
    isReadonly,
    updateStage,
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const { variablesPipeline, metadataMap } = usePipelineVariables()
  const { stage } = getStageFromPipeline(selectedStageId || '')
  const cloneOriginalData = cloneDeep(stage)

  const { getString } = useStrings()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateStageDebounced = useCallback(
    debounce((values: StageElementWrapper): void => {
      updateStage({ ...stage?.stage, ...values })
    }, 300),
    [stage?.stage, updateStage]
  )

  return (
    <div className={cx(css.approvalStageOverviewWrapper, css.stageSection)}>
      <div className={css.content} ref={scrollRef}>
        <div className={css.tabHeading} id="stageOverview">
          {getString('stageOverview')}
        </div>
        <Container id="stageOverview" className={css.basicOverviewDetails}>
          <Formik
            enableReinitialize
            initialValues={{
              identifier: cloneOriginalData?.stage.identifier,
              name: cloneOriginalData?.stage.name,
              description: cloneOriginalData?.stage.description,
              skipCondition: cloneOriginalData?.stage.skipCondition,
              tags: cloneOriginalData?.stage.tags || {}
            }}
            validationSchema={{
              name: NameSchema({ requiredErrorMsg: getString('approvalStage.stageNameRequired') }),
              identifier: IdentifierSchema()
            }}
            validate={values => {
              const errors: { name?: string } = {}
              if (isDuplicateStageId(values.identifier, stages)) {
                errors.name = getString('validation.identifierDuplicate')
              }
              if (cloneOriginalData) {
                updateStageDebounced({
                  ...cloneOriginalData.stage,
                  name: values?.name,
                  identifier: values?.identifier,
                  description: values?.description,
                  skipCondition: values?.skipCondition
                })
              }
              return errors
            }}
            onSubmit={values => {
              if (cloneOriginalData) {
                updateStageDebounced({
                  ...cloneOriginalData.stage,
                  name: values?.name,
                  identifier: values?.identifier,
                  description: values?.description,
                  skipCondition: values?.skipCondition
                })
              }
            }}
          >
            {formikProps => (
              <FormikForm>
                <Card className={cx(css.sectionCard)}>
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    descriptionProps={{
                      disabled: isReadonly
                    }}
                    identifierProps={{
                      isIdentifierEditable: false,
                      inputGroupProps: { disabled: isReadonly }
                    }}
                    tagsProps={{
                      disabled: isReadonly
                    }}
                  />
                </Card>
              </FormikForm>
            )}
          </Formik>
        </Container>

        <Accordion className={cx(css.accordionTitle)} activeId="variables">
          <Accordion.Panel
            id="variables"
            summary={'Advanced'}
            addDomId={true}
            details={
              <Card className={css.sectionCard} id="variables">
                <div className={css.tabSubHeading}>Stage Variables</div>
                <Layout.Horizontal>
                  <StepWidget<CustomVariablesData>
                    factory={stepsFactory}
                    readonly={isReadonly}
                    initialValues={{
                      variables: ((cloneOriginalData?.stage as StageElementConfig)?.variables ||
                        []) as AllNGVariables[],
                      canAddVariable: true
                    }}
                    type={StepType.CustomVariable}
                    stepViewType={StepViewType.StageVariable}
                    onUpdate={({ variables }: CustomVariablesData) => {
                      updateStageDebounced({
                        ...cloneOriginalData?.stage,
                        variables
                      })
                    }}
                    customStepProps={{
                      yamlProperties:
                        getStageFromPipeline(
                          cloneOriginalData?.stage?.identifier,
                          variablesPipeline
                        )?.stage?.variables?.map?.(
                          (variable: AllNGVariables) => metadataMap[variable.value || '']?.yamlProperties || {}
                        ) || []
                    }}
                  />
                </Layout.Horizontal>
              </Card>
            }
          />
        </Accordion>

        {props.children}
      </div>
    </div>
  )
}
