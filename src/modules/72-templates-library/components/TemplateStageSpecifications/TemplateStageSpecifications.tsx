import React, { useContext } from 'react'
import { debounce, defaultTo, isEqual, merge, noop, omit, set } from 'lodash-es'
import { Card, Color, Container, Formik, FormikForm, Heading, Layout, PageError } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import type { FormikProps } from 'formik'
import produce from 'immer'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { Error, StageElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { PageSpinner } from '@common/components'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useToaster } from '@common/exports'
import { useGetTemplateInputSetYaml } from 'services/template-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StageForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { TemplateTabs } from '@templates-library/components/TemplateStageSetupShell/TemplateStageSetupShellUtils'
import { validateStage } from '@pipeline/components/PipelineStudio/StepUtil'
import { useGlobalEventListener } from '@common/hooks'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { useStageTemplateActions } from '@pipeline/utils/useStageTemplateActions'
import { TemplateBar } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { setTemplateInputs, TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import css from './TemplateStageSpecifications.module.scss'

declare global {
  interface WindowEventMap {
    SAVE_PIPELINE_CLICKED: CustomEvent<string>
  }
}

export interface TemplateStageValues extends StageElementConfig {
  inputSetTemplate?: StageElementConfig
}

export const TemplateStageSpecifications = (): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId = '' }
    },
    allowableTypes,
    updateStage,
    isReadonly,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline(selectedStageId)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [formValues, setFormValues] = React.useState<TemplateStageValues>(stage?.stage as TemplateStageValues)
  const scope = getScopeFromValue(defaultTo(stage?.stage?.template?.templateRef, ''))
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { submitFormsForTab } = useContext(StageErrorContext)
  const { showError } = useToaster()
  const { getString } = useStrings()

  const onChange = React.useCallback(
    debounce(async (values: StageElementConfig): Promise<void> => {
      await updateStage({ ...stage?.stage, ...values })
    }, 300),
    [stage?.stage, updateStage]
  )

  const {
    data: templateInputYaml,
    error: inputSetError,
    refetch,
    loading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: getIdentifierFromValue(defaultTo(stage?.stage?.template?.templateRef, '')),
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      versionLabel: defaultTo(stage?.stage?.template?.versionLabel, '')
    }
  })

  React.useEffect(() => {
    if (!loading && stage?.stage) {
      try {
        const templateInputs = parse(defaultTo(templateInputYaml?.data, ''))
        const mergedTemplateInputs = merge({}, templateInputs, stage?.stage.template?.templateInputs)
        setFormValues(
          produce(stage?.stage as TemplateStageValues, draft => {
            setTemplateInputs(draft, mergedTemplateInputs)
            if (templateInputs) {
              draft.inputSetTemplate = templateInputs
            }
          })
        )
        setTemplateInputs(stage.stage, mergedTemplateInputs)
        updateStage(stage.stage)
      } catch (error) {
        showError(error.message, undefined, 'template.parse.inputSet.error')
      }
    }
  }, [templateInputYaml?.data, loading])

  React.useEffect(() => {
    subscribeForm({ tab: TemplateTabs.OVERVIEW, form: formikRef })
    return () => unSubscribeForm({ tab: TemplateTabs.OVERVIEW, form: formikRef })
  }, [subscribeForm, unSubscribeForm, formikRef])

  useGlobalEventListener('SAVE_PIPELINE_CLICKED', _event => {
    submitFormsForTab(TemplateTabs.OVERVIEW)
  })

  const validateForm = (values: TemplateStageValues) => {
    if (
      isEqual(values.template?.templateRef, stage?.stage?.template?.templateRef) &&
      isEqual(values.template?.versionLabel, stage?.stage?.template?.versionLabel)
    ) {
      onChange?.(omit(values, 'inputSetTemplate'))
      const errorsResponse = validateStage({
        stage: values.template?.templateInputs as StageElementConfig,
        template: values.inputSetTemplate,
        originalStage: stage?.stage?.template?.templateInputs as StageElementConfig,
        getString,
        viewType: StepViewType.DeploymentForm
      })
      return set({}, TEMPLATE_INPUT_PATH, errorsResponse)
    } else {
      return {}
    }
  }

  const { onRemoveTemplate, onOpenTemplateSelector } = useStageTemplateActions()

  return (
    <Container className={css.serviceOverrides} height={'100%'} background={Color.FORM_BG}>
      <ErrorsStripBinded />
      <Layout.Vertical spacing={'xlarge'} className={css.contentSection}>
        {stage?.stage?.template && (
          <TemplateBar
            templateLinkConfig={stage?.stage.template}
            onRemoveTemplate={onRemoveTemplate}
            onOpenTemplateSelector={onOpenTemplateSelector}
            className={css.templateBar}
          />
        )}
        <Formik<TemplateStageValues>
          initialValues={formValues}
          formName="templateStageOverview"
          onSubmit={noop}
          validate={validateForm}
          validationSchema={Yup.object().shape({
            name: NameSchema({
              requiredErrorMsg: getString('pipelineSteps.build.create.stageNameRequiredError')
            }),
            identifier: IdentifierSchema()
          })}
          enableReinitialize={true}
        >
          {(formik: FormikProps<TemplateStageValues>) => {
            window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: TemplateTabs.OVERVIEW }))
            formikRef.current = formik
            return (
              <FormikForm>
                <Card className={css.sectionCard}>
                  <NameId
                    identifierProps={{
                      inputLabel: getString('stageNameLabel'),
                      isIdentifierEditable: false,
                      inputGroupProps: { disabled: isReadonly }
                    }}
                    inputGroupProps={{ placeholder: getString('common.namePlaceholder') }}
                  />
                </Card>
                <Container className={css.inputsContainer}>
                  {loading && <PageSpinner />}
                  {!loading && inputSetError && (
                    <Container height={300}>
                      <PageError
                        message={defaultTo((inputSetError.data as Error)?.message, inputSetError.message)}
                        onClick={() => refetch()}
                      />
                    </Container>
                  )}
                  {!loading && !inputSetError && formik.values.inputSetTemplate && (
                    <Layout.Vertical
                      margin={{ top: 'medium' }}
                      padding={{ top: 'large', bottom: 'large' }}
                      spacing={'large'}
                    >
                      <Heading level={5} color={Color.BLACK}>
                        {getString('templatesLibrary.templateInputs')}
                      </Heading>
                      <StageForm
                        key={`${formik.values.template?.templateRef}-${formik.values.template?.versionLabel || ''}`}
                        template={{ stage: formik.values.inputSetTemplate }}
                        allValues={{ stage: formik.values.template?.templateInputs as StageElementConfig }}
                        path={TEMPLATE_INPUT_PATH}
                        readonly={isReadonly}
                        viewType={StepViewType.InputSet}
                        hideTitle={true}
                        stageClassName={css.stageCard}
                        allowableTypes={allowableTypes}
                      />
                    </Layout.Vertical>
                  )}
                </Container>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Container>
  )
}
