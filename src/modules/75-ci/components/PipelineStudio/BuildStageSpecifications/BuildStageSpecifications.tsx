import React, { useEffect } from 'react'
import * as yup from 'yup'
import { Layout, Button, Formik, FormikForm, FormInput, Switch, Text, Card, Accordion } from '@wings-software/uicore'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { isEqual, debounce, cloneDeep, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { produce } from 'immer'
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
import css from './BuildStageSpecifications.module.scss'

const logger = loggerFor(ModuleName.CD)

export interface Variable {
  name: string
  type: string
  value?: string
}

export default function BuildStageSpecifications({ children }: React.PropsWithChildren<unknown>): JSX.Element {
  const [isDescriptionVisible, setDescriptionVisible] = React.useState(false)

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

  const { stage = {} } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  const getInitialValues = (): {
    identifier: string
    name: string
    description: string
    cloneCodebase: boolean
    sharedPaths: string[]
    variables: NGVariable[]
  } => {
    const pipelineData = stage?.stage || null
    const spec = stage?.stage?.spec || null

    const identifier = pipelineData?.identifier || ''
    const name = pipelineData?.name || ''
    const description = pipelineData?.description || ''
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
      cloneCodebase,
      sharedPaths: sharedPaths as any,
      variables
    }
  }

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
      <div className={css.contentSection} ref={scrollRef}>
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          validate={debounceHandleValidate}
          formName="ciBuildStage"
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {({ values: formValues, setFieldValue }) => (
            <>
              <div className={css.tabHeading} id="stageDetails">
                {getString('stageDetails')}
              </div>
              <Card className={cx(css.sectionCard)} disabled={isReadonly}>
                <FormikForm>
                  <Layout.Horizontal spacing="medium">
                    <FormInput.InputWithIdentifier
                      inputName="name"
                      inputLabel={getString('stageNameLabel')}
                      inputGroupProps={{
                        className: css.fields,
                        placeholder: getString('pipeline.aboutYourStage.stageNamePlaceholder'),
                        disabled: isReadonly
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
                          disabled={isReadonly}
                        />
                      )}
                    </div>
                  </Layout.Horizontal>

                  {(isDescriptionVisible || formValues.description) && (
                    <div className={css.fields}>
                      {!isReadonly && (
                        <span
                          onClick={() => {
                            setDescriptionVisible(false)
                            setFieldValue('description', '')
                          }}
                          className={css.removeLink}
                        >
                          {getString('removeLabel')}
                        </span>
                      )}
                      <FormInput.TextArea name={'description'} label={getString('description')} disabled={isReadonly} />
                    </div>
                  )}

                  <Switch
                    checked={formValues.cloneCodebase}
                    label={getString('cloneCodebaseLabel')}
                    onChange={e => setFieldValue('cloneCodebase', e.currentTarget.checked)}
                    disabled={isReadonly}
                  />
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
                        <Text style={{ display: 'flex', alignItems: 'center', minWidth: '171px' }}>
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
                      <Layout.Horizontal>
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
                      </Layout.Horizontal>
                    </Card>
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
