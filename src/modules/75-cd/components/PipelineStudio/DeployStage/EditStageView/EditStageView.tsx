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
  Layout,
  Accordion,
  HarnessDocTooltip
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import type { IconName } from '@blueprintjs/core'
import produce from 'immer'
import { set } from 'lodash-es'
import type { StageElementWrapper, StageElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
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
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
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
  const allNGVariables = ((data?.stage as StageElementConfig)?.variables || []) as AllNGVariables[]

  return (
    <div className={cx({ [css.contentSection]: context })} ref={scrollRef}>
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
              serviceType: newStageData[0]
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
                    <Card className={cx(css.sectionCard)}>
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

                  <Card className={cx(css.sectionCard)}>
                    <div
                      className={cx(css.tabSubHeading, 'ng-tooltip-native')}
                      id="whatToDeploy"
                      data-tooltip-id="whatToDeploy"
                    >
                      {getString('whatToDeploy')}
                      <HarnessDocTooltip tooltipId="whatToDeploy" useStandAlone={true} />
                    </div>
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
                            disabled={item.disabled || isReadonly}
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
            summary={'Advanced'}
            details={
              <Card className={css.sectionCard} id="variables">
                <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id="overviewStageVariables">
                  Stage Variables
                  <HarnessDocTooltip tooltipId="overviewStageVariables" useStandAlone={true} />
                </div>
                <Layout.Horizontal>
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
                </Layout.Horizontal>
              </Card>
            }
          />
        </Accordion>
      )}
      <div className={cx(css.navigationButtons, { [css.createModal]: !context })}>{children}</div>
    </div>
  )
}
