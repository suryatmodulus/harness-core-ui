import React from 'react'
import {
  Text,
  Container,
  Formik,
  FormikForm,
  Button,
  Icon,
  Card,
  CardSelectType,
  CardSelect,
  Label,
  Layout,
  ExpressionInput,
  Accordion
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import type { IconName } from '@blueprintjs/core'
import type { StageElementWrapper, StageElementConfig } from 'services/cd-ng'
import { useStrings, String } from 'framework/exports'
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
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import Timeline from '@common/components/Timeline/Timeline'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import css from './EditStageView.module.scss'

const skipConditionsNgDocsLink = 'https://ngdocs.harness.io/article/i36ibenkq2-step-skip-condition-settings'

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
  const newStageData = [
    {
      text: getString('service'),
      value: 'service',
      icon: 'service',
      disabled: false
    },
    {
      text: getString('multipleService'),
      value: 'multiple-service',
      icon: 'multi-service',
      disabled: true
    },
    {
      text: getString('functions'),
      value: 'functions',
      icon: 'functions',
      disabled: true
    },
    {
      text: getString('otherWorkloads'),
      value: 'other-workloads',
      icon: 'other-workload',
      disabled: true
    }
  ]
  const { stepsFactory, getStageFromPipeline } = usePipelineContext()
  const { variablesPipeline, metadataMap } = usePipelineVariables()
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const { expressions } = useVariablesExpression()
  const onTimelineItemClick = (id: string): void => {
    const element = document.querySelector(`#${id}`)
    if (scrollRef.current && element) {
      const elementTop = element.getBoundingClientRect().top
      const parentTop = scrollRef.current.getBoundingClientRect().top
      scrollRef.current.scrollTo({ top: elementTop - parentTop, behavior: 'smooth' })
    }
  }
  const getTimelineNodes = React.useCallback(
    () => [
      {
        label: 'Stage Overview',
        id: 'stageOverview'
      },
      {
        label: 'Deploy',
        id: 'whatToDeploy'
      },
      {
        label: 'Stage variables',
        id: 'variables-panel'
      },
      {
        label: 'Skip Conditions',
        id: 'skipCondition-panel'
      }
    ],
    []
  )

  return (
    <div className={cx(css.stageSection, { [css.editStageGrid]: context, [css.createStageGrid]: !context })}>
      {context && <Timeline onNodeClick={onTimelineItemClick} nodes={getTimelineNodes()} />}
      <div className={cx({ [css.contentSection]: context })} ref={scrollRef}>
        <div className={cx({ [css.stagePopover]: !context })}>
          <div className={cx({ [css.stageCreate]: true, [css.stageDetails]: !!context })}>
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
                  skipCondition: data?.stage.skipCondition,
                  serviceType: newStageData[0]
                }}
                onSubmit={values => {
                  if (data) {
                    data.stage.identifier = values.identifier
                    data.stage.name = values.name
                    data.stage.description = values.description
                    data.stage.tags = values.tags || {}
                    onSubmit?.(data, values.identifier)
                  }
                }}
                validate={values => {
                  const errors: { name?: string } = {}
                  if (isDuplicateStageId(values.identifier, stages)) {
                    errors.name = getString('validation.identifierDuplicate')
                  }
                  if (context && data) {
                    onChange?.(values)
                  }
                  return errors
                }}
                validationSchema={Yup.object().shape({
                  name: Yup.string().trim().required(getString('pipelineSteps.build.create.stageNameRequiredError')),
                  identifier: Yup.string().when('name', {
                    is: val => val?.length,
                    then: Yup.string()
                      .required(getString('validation.identifierRequired'))
                      .matches(regexIdentifier, getString('validation.validIdRegex'))
                      .notOneOf(illegalIdentifiers)
                  })
                })}
              >
                {formikProps => {
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

                      <div className={css.tabHeading} id="whatToDeploy">
                        {getString('whatToDeploy')}
                      </div>
                      <Card className={cx(css.sectionCard, css.shadow, { [css.notwide]: !context })}>
                        <CardSelect
                          type={CardSelectType.Any} // TODO: Remove this by publishing uikit with exported CardSelectType
                          selected={formikProps.values.serviceType}
                          onChange={item => formikProps.setFieldValue('serviceType', item)}
                          renderItem={(item, selected) => (
                            <div
                              key={item.text}
                              className={css.squareCardContainer}
                              onClick={e => {
                                if (item.disabled) {
                                  e.stopPropagation()
                                }
                              }}
                            >
                              <Card
                                selected={selected}
                                cornerSelected={selected}
                                interactive={!item.disabled}
                                disabled={item.disabled}
                                className={css.squareCard}
                              >
                                <Icon name={item.icon as IconName} size={26} height={26} />
                              </Card>
                              <Text
                                style={{
                                  fontSize: '12px',
                                  color: selected ? 'var(--grey-900)' : 'var(--grey-350)',
                                  textAlign: 'center'
                                }}
                              >
                                {item.text}
                              </Text>
                            </div>
                          )}
                          data={newStageData}
                          className={css.grid}
                        />
                      </Card>

                      {!context && (
                        <div className={css.btnSetup}>
                          <Button
                            type="submit"
                            intent="primary"
                            text={getString('pipelineSteps.build.create.setupStage')}
                            onClick={() => {
                              formikProps.submitForm()
                            }}
                          />
                        </div>
                      )}
                    </FormikForm>
                  )
                }}
              </Formik>
            </Container>
          </div>
        </div>
        {context && (
          <Accordion className={cx(css.sectionCard, css.shadow)} activeId="variables">
            <Accordion.Panel
              id="variables"
              summary={'Variables'}
              addDomId={true}
              details={
                <div className={css.stageSection}>
                  <div className={cx(css.stageDetails)}>
                    {context ? (
                      <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                        factory={stepsFactory}
                        initialValues={{
                          variables: ((data?.stage as StageElementConfig)?.variables || []) as AllNGVariables[],
                          canAddVariable: true
                        }}
                        readonly={isReadonly}
                        type={StepType.CustomVariable}
                        stepViewType={StepViewType.StageVariable}
                        onUpdate={({ variables }: CustomVariablesData) => {
                          onChange?.({ ...data?.stage, variables } as StageElementConfig)
                        }}
                        customStepProps={{
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
              }
            />
          </Accordion>
        )}
        {context && (
          <Accordion activeId="skipCondition" className={cx(css.sectionCard, css.shadow)}>
            <Accordion.Panel
              summary={getString('skipConditionsTitle')}
              id="skipCondition"
              addDomId={true}
              details={
                <div className={css.stageSection}>
                  <div className={cx({ [css.stageCreate]: true, [css.stageDetails]: !!context })}>
                    <Layout.Vertical>
                      <div className={css.labelBold}>
                        <Label>
                          <String stringID="skipConditionStageLabel" />
                        </Label>
                      </div>
                      <div>
                        <ExpressionInput
                          items={expressions}
                          name="skipCondition"
                          value={data?.stage.skipCondition}
                          disabled={isReadonly}
                          inputProps={{ disabled: isReadonly }}
                          onChange={str => {
                            onChange?.({ ...data?.stage, skipCondition: str } as any)
                          }}
                        />
                        <Text font="small" style={{ whiteSpace: 'break-spaces' }}>
                          <String stringID="skipConditionText" />
                          <br />
                          <a href={skipConditionsNgDocsLink} target="_blank" rel="noreferrer">
                            <String stringID="learnMore" />
                          </a>
                        </Text>
                      </div>
                    </Layout.Vertical>
                  </div>
                </div>
              }
            />
          </Accordion>
        )}
        <div className={cx(css.navigationButtons, { [css.createModal]: !context })}>{children}</div>
      </div>
    </div>
  )
}
