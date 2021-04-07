import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Layout, Button, Formik, FormikForm, FormInput, Switch, Text, Card, Accordion } from '@wings-software/uicore'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { isEqual, debounce, cloneDeep } from 'lodash-es'
import cx from 'classnames'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { StageElementConfig } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { useStrings } from 'framework/exports'
import { loggerFor, ModuleName } from 'framework/exports'
import Timeline from '@common/components/Timeline/Timeline'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { skipConditionsNgDocsLink } from '@pipeline/components/PipelineSteps/AdvancedSteps/SkipConditionsPanel/SkipConditionsPanel'
import type { StageElementWrapper } from 'services/cd-ng'
import css from './BuildStageSpecifications.module.scss'

const logger = loggerFor(ModuleName.CD)

const validationSchema = yup.object().shape({
  name: yup.string().trim().required()
})

export interface Variable {
  name: string
  type: string
  value?: string
}

const TimelineNodes = [
  {
    label: 'Stage Details',
    id: 'stageDetails'
  },
  {
    label: 'Shared Paths',
    id: 'sharedPaths'
  },
  {
    label: 'Variables',
    id: 'variables-panel'
  },
  {
    label: 'Skip Conditions',
    id: 'skipConditions-panel'
  }
]

export default function BuildStageSpecifications({ children }: React.PropsWithChildren<unknown>): JSX.Element {
  const [isDescriptionVisible, setDescriptionVisible] = React.useState(false)

  const { variablesPipeline, metadataMap } = usePipelineVariables()

  const { getString } = useStrings()

  const {
    state: {
      pipeline,
      pipelineView: {
        splitViewData: { selectedStageId }
      }
    },
    getStageFromPipeline,
    updatePipeline,
    updateStage,
    stepsFactory
  } = React.useContext(PipelineContext)

  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const { stage = {} } = getStageFromPipeline(selectedStageId || '')

  const onTimelineItemClick = (id: string) => {
    const element = document.querySelector(`#${id}`)
    if (scrollRef.current && element) {
      const elementTop = element.getBoundingClientRect().top
      const parentTop = scrollRef.current.getBoundingClientRect().top
      scrollRef.current.scrollTo({ top: elementTop - parentTop, behavior: 'smooth' })
    }
  }

  const getInitialValues = (): {
    identifier: string
    name: string
    description: string
    cloneCodebase: boolean
    sharedPaths: string[]
    variables: { name: string; type: string; value?: string }[]
    skipCondition: string
  } => {
    const pipelineData = stage?.stage || null
    const spec = stage?.stage?.spec || null

    const identifier = pipelineData?.identifier || ''
    const name = pipelineData?.name || ''
    const description = pipelineData?.description || ''
    const cloneCodebase = spec?.cloneCodebase
    const sharedPaths =
      typeof spec?.sharedPaths === 'string'
        ? spec?.sharedPaths
        : spec?.sharedPaths?.map((_value: string) => ({
            id: uuid('', nameSpace()),
            value: _value
          })) || []
    const variables = pipelineData?.variables || []
    const skipCondition = pipelineData?.skipCondition || ''
    if (Array.isArray(sharedPaths) && sharedPaths.length === 0) {
      sharedPaths.push({ id: uuid('', nameSpace()), value: '' })
    }

    return {
      identifier,
      name,
      description,
      cloneCodebase,
      sharedPaths,
      variables,
      skipCondition
    }
  }

  const handleValidate = (values: any): void => {
    if (stage?.stage) {
      const prevStageData = cloneDeep(stage.stage)
      const stageData = stage.stage
      const spec = stage.stage.spec

      stageData.identifier = values.identifier
      stageData.name = values.name

      if (values.description) {
        stageData.description = values.description
      } else {
        delete stageData.description
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

      if (!isEqual(prevStageData, stageData)) {
        updatePipeline(pipeline)
      }
    }
  }

  const debounceHandleValidate = React.useRef(
    debounce((values: any) => {
      return handleValidate(values)
    }, 500)
  ).current

  const handleStepWidgetUpdate = React.useCallback(
    debounce((values: StageElementWrapper): void => {
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
      <Timeline onNodeClick={onTimelineItemClick} nodes={TimelineNodes} />

      <div className={css.contentSection} ref={scrollRef}>
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          validate={debounceHandleValidate}
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {({ values: formValues, setFieldValue }) => (
            <>
              <div className={css.tabHeading} id="stageDetails">
                {getString('stageDetails')}
              </div>
              <Card className={cx(css.sectionCard, css.shadow)}>
                <FormikForm>
                  <Layout.Horizontal spacing="medium">
                    <FormInput.InputWithIdentifier
                      inputName="name"
                      inputLabel={getString('stageNameLabel')}
                      inputGroupProps={{
                        className: css.fields,
                        placeholder: getString('pipelineSteps.build.stageSpecifications.stageNamePlaceholder')
                      }}
                      isIdentifierEditable={false}
                    />
                    <div className={css.addDataLinks}>
                      {!isDescriptionVisible && !formValues.description && (
                        <Button
                          minimal
                          text={getString('pipelineSteps.build.stageSpecifications.addDescription')}
                          icon="plus"
                          onClick={() => setDescriptionVisible(true)}
                        />
                      )}
                    </div>
                  </Layout.Horizontal>

                  {(isDescriptionVisible || formValues.description) && (
                    <div className={css.fields}>
                      <span
                        onClick={() => {
                          setDescriptionVisible(false)
                          setFieldValue('description', '')
                        }}
                        className={css.removeLink}
                      >
                        {getString('removeLabel')}
                      </span>
                      <FormInput.TextArea name={'description'} label={getString('description')} />
                    </div>
                  )}

                  <Switch
                    checked={formValues.cloneCodebase}
                    label={getString('cloneCodebaseLabel')}
                    onChange={e => setFieldValue('cloneCodebase', e.currentTarget.checked)}
                  />
                </FormikForm>
              </Card>

              <div className={css.tabHeading} id="sharedPaths">
                {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
              </div>
              <Card className={cx(css.sectionCard, css.shadow)}>
                <FormikForm className={css.fields}>
                  <MultiTypeList
                    name="sharedPaths"
                    multiTextInputProps={{ expressions }}
                    multiTypeFieldSelectorProps={{
                      label: (
                        <Text style={{ display: 'flex', alignItems: 'center' }}>
                          {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                          <Button
                            icon="question"
                            minimal
                            tooltip={getString('pipelineSteps.build.stageSpecifications.sharedPathsInfo')}
                            iconProps={{ size: 14 }}
                          />
                        </Text>
                      )
                    }}
                  />
                </FormikForm>
              </Card>
              <Accordion className={cx(css.sectionCard, css.shadow)} activeId="variables">
                <Accordion.Panel
                  id="variables"
                  summary={'Variables'}
                  addDomId={true}
                  details={
                    <div className={css.stageSection}>
                      <div className={css.stageDetails}>
                        <StepWidget<CustomVariablesData>
                          factory={stepsFactory}
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
                            yamlProperties:
                              getStageFromPipeline(
                                stage?.stage?.identifier,
                                variablesPipeline
                              )?.stage?.variables?.map?.(
                                (variable: AllNGVariables) => metadataMap[variable.value || '']?.yamlProperties || {}
                              ) || []
                          }}
                        />
                      </div>
                    </div>
                  }
                />
              </Accordion>

              <Accordion className={css.sectionCard} activeId="skipConditions">
                <Accordion.Panel
                  id="skipConditions"
                  addDomId={true}
                  summary={getString('skipConditionsTitle')}
                  details={
                    <FormikForm style={{ width: 300 }}>
                      <FormInput.ExpressionInput
                        items={expressions}
                        name="skipCondition"
                        label={getString('skipConditionStageLabel')}
                      />
                      <Text font="small" style={{ whiteSpace: 'break-spaces' }}>
                        {getString('skipConditionText')}
                        <br />
                        <a href={skipConditionsNgDocsLink} target="_blank" rel="noreferrer">
                          {getString('learnMore')}
                        </a>
                      </Text>
                    </FormikForm>
                  }
                />
              </Accordion>
            </>
          )}
        </Formik>
        <div className={css.navigationButtons}>{children}</div>
      </div>
    </div>
  )
}
