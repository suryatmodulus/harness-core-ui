import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Formik, FormikForm, Switch, Text, Card, Accordion, HarnessDocTooltip } from '@wings-software/uicore'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { isEqual, debounce, cloneDeep, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { produce } from 'immer'
import type { FormikProps } from 'formik'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { NGVariable, StageElementConfig, StringNGVariable } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { NameSchema } from '@common/utils/Validation'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { BuildTabs } from '../CIPipelineStagesUtils'
import css from './BuildStageSpecifications.module.scss'

const logger = loggerFor(ModuleName.CD)

export interface Variable {
  name: string
  type: string
  value?: string
}

export default function BuildStageSpecifications({ children }: React.PropsWithChildren<unknown>): JSX.Element {
  const { variablesPipeline, metadataMap } = usePipelineVariables()

  const { getString } = useStrings()

  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    stepsFactory,
    isReadonly
  } = React.useContext(PipelineContext)

  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const { stage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  const getInitialValues = (): {
    identifier: string
    name: string
    description: string
    tags?: { [key: string]: string }
    cloneCodebase: boolean
    sharedPaths: string[]
    variables: NGVariable[]
  } => {
    const pipelineData = stage?.stage || null
    const spec = stage?.stage?.spec || null

    const identifier = pipelineData?.identifier || ''
    const name = pipelineData?.name || ''
    const description = pipelineData?.description || ''
    const tags = pipelineData?.tags
    const cloneCodebase = !!spec?.cloneCodebase
    const sharedPaths =
      typeof spec?.sharedPaths === 'string'
        ? spec?.sharedPaths
        : spec?.sharedPaths
            ?.filter((path: string) => !!path)
            ?.map((_value: string) => ({
              id: uuid('', nameSpace()),
              value: _value
            })) || []
    const variables = pipelineData?.variables || []

    return {
      identifier,
      name,
      description,
      tags,
      cloneCodebase,
      sharedPaths: sharedPaths as any,
      variables
    }
  }

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: BuildTabs.OVERVIEW, form: formikRef })
    return () => unSubscribeForm({ tab: BuildTabs.OVERVIEW, form: formikRef })
  }, [])

  const validationSchema = yup.object().shape({
    name: NameSchema()
  })

  const handleValidate = (values: any): void => {
    if (stage?.stage) {
      const prevStageData = cloneDeep(stage.stage)
      const newStageData = produce(stage.stage, (stageData: any) => {
        const spec = stageData.spec

        stageData.identifier = values.identifier
        stageData.name = values.name

        if (values.description) {
          stageData.description = values.description
        } else {
          delete stageData.description
        }

        if (values.tags) {
          stageData.tags = values.tags
        } else {
          delete stageData.tags
        }

        spec.cloneCodebase = values.cloneCodebase

        if (values.sharedPaths && values.sharedPaths.length > 0) {
          spec.sharedPaths =
            typeof values.sharedPaths === 'string'
              ? values.sharedPaths
              : values.sharedPaths.map((listValue: { id: string; value: string }) => listValue.value)
        } else {
          delete spec.sharedPaths
        }

        if (values.variables && values.variables.length > 0) {
          stageData.variables = values.variables
        } else {
          delete stageData.variables
        }

        if (values.skipCondition) {
          stageData.skipCondition = values.skipCondition
        } else {
          delete stageData.skipCondition
        }
      })

      if (!isEqual(prevStageData, newStageData)) {
        updateStage(newStageData as unknown as StageElementConfig)
      }
    }
  }

  const debounceHandleValidate = React.useRef(
    debounce((values: any) => {
      return handleValidate(values)
    }, 500)
  ).current

  const handleStepWidgetUpdate = React.useCallback(
    debounce((values: StageElementConfig): void => {
      updateStage({ ...stage?.stage, ...values })
    }, 300),
    [stage?.stage, updateStage]
  )

  // Cleanup debounce
  useEffect(() => {
    return () => {
      debounceHandleValidate.flush()
    }
  }, [])

  const { expressions } = useVariablesExpression()

  return (
    <div className={css.wrapper}>
      <ErrorsStripBinded />
      <div className={css.contentSection} ref={scrollRef}>
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          validate={debounceHandleValidate}
          formName="ciBuildStage"
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {formik => {
            const { values: formValues, setFieldValue } = formik
            window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: BuildTabs.OVERVIEW }))
            formikRef.current = formik
            return (
              <>
                <div className={css.tabHeading} id="stageDetails">
                  {getString('stageDetails')}
                </div>
                <Card className={cx(css.sectionCard)} disabled={isReadonly}>
                  <FormikForm>
                    <NameIdDescriptionTags
                      formikProps={formik}
                      identifierProps={{
                        isIdentifierEditable: false,
                        inputGroupProps: { disabled: isReadonly }
                      }}
                      descriptionProps={{ disabled: isReadonly }}
                      tagsProps={{ disabled: isReadonly }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Switch
                        checked={formValues.cloneCodebase}
                        label={getString('cloneCodebaseLabel')}
                        onChange={e => setFieldValue('cloneCodebase', e.currentTarget.checked)}
                        disabled={isReadonly}
                      />
                      <HarnessDocTooltip tooltipId="cloneCodebase" useStandAlone={true} />
                    </div>
                  </FormikForm>
                </Card>

                <div className={css.tabHeading} id="sharedPaths">
                  {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                </div>
                <Card disabled={isReadonly} className={cx(css.sectionCard)}>
                  <FormikForm className={cx(css.fields, css.contentCard)}>
                    <MultiTypeList
                      name="sharedPaths"
                      multiTextInputProps={{ expressions }}
                      multiTypeFieldSelectorProps={{
                        label: (
                          <Text tooltipProps={{ dataTooltipId: 'stageSpecificationsSharedPaths' }}>
                            {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                          </Text>
                        )
                      }}
                      disabled={isReadonly}
                    />
                  </FormikForm>
                </Card>

                <Accordion className={css.accordionTitle} activeId="advanced">
                  <Accordion.Panel
                    id="advanced"
                    addDomId={true}
                    summary={'Advanced'}
                    details={
                      <Card className={css.sectionCard} id="variables">
                        <div className={css.tabSubHeading}>Stage Variables</div>
                        <div className={css.stageSection}>
                          <div className={css.stageDetails}>
                            <StepWidget<CustomVariablesData>
                              factory={stepsFactory}
                              readonly={isReadonly}
                              initialValues={{
                                variables: ((stage?.stage as StageElementConfig)?.variables || []) as AllNGVariables[],
                                canAddVariable: true
                              }}
                              type={StepType.CustomVariable}
                              stepViewType={StepViewType.StageVariable}
                              onUpdate={({ variables }: CustomVariablesData) => {
                                handleStepWidgetUpdate({ ...stage?.stage, variables } as StageElementConfig)
                              }}
                              customStepProps={{
                                yamlProperties: defaultTo(
                                  getStageFromPipeline<BuildStageElementConfig>(
                                    stage?.stage?.identifier || '',
                                    variablesPipeline
                                  )?.stage?.stage?.variables?.map?.(
                                    variable =>
                                      metadataMap[(variable as StringNGVariable).value || '']?.yamlProperties || {}
                                  ),
                                  []
                                )
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    }
                  />
                </Accordion>
              </>
            )
          }}
        </Formik>
        <div className={css.navigationButtons}>{children}</div>
      </div>
    </div>
  )
}
