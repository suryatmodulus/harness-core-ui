import React, { useContext } from 'react'
import { debounce, defaultTo, isEqual, merge, noop, set } from 'lodash-es'
import { Card, Color, Container, Formik, FormikForm, Heading, Layout, PageError } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import type { FormikProps } from 'formik'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { StageElementConfig } from 'services/cd-ng'
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
import { StageTemplateBar } from '@pipeline/components/PipelineStudio/StageTemplateBar/StageTemplateBar'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { TemplateTabs } from '@templates-library/components/TemplateStageSetupShell/TemplateStageSetupShellUtils'
import { validateStage } from '@pipeline/components/PipelineStudio/StepUtil'
import { useGlobalEventListener } from '@common/hooks'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import css from './TemplateStageSpecifications.module.scss'

declare global {
  interface WindowEventMap {
    SAVE_PIPELINE_CLICKED: CustomEvent<string>
  }
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
  const [inputSetTemplate, setInputSetTemplate] = React.useState<StageElementConfig>()
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
        setInputSetTemplate(templateInputs)
        if (!isEqual(templateInputs, stage?.stage.template?.templateInputs)) {
          set(stage, 'stage.template.templateInputs', merge({}, templateInputs, stage?.stage.template?.templateInputs))
          updateStage(stage.stage)
        }
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

  const validateForm = (values: StageElementConfig) => {
    onChange?.(values)
    const errorsResponse = validateStage({
      stage: values.template?.templateInputs as StageElementConfig,
      template: inputSetTemplate,
      originalStage: stage?.stage?.template?.templateInputs as StageElementConfig,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    return set({}, 'template.templateInputs', errorsResponse)
  }

  return (
    <Container className={css.serviceOverrides} height={'100%'} background={Color.FORM_BG}>
      {loading && <PageSpinner />}
      {!loading && inputSetError && <PageError message={inputSetError.message} onClick={() => refetch()} />}
      {!loading && !inputSetError && inputSetTemplate && stage?.stage?.template?.templateInputs && (
        <>
          <ErrorsStripBinded />
          <Container className={css.contentSection}>
            <StageTemplateBar />
            <Formik<StageElementConfig>
              initialValues={{
                name: defaultTo(stage?.stage?.name, ''),
                identifier: defaultTo(stage?.stage?.identifier, ''),
                template: defaultTo(stage?.stage?.template, {
                  templateRef: '',
                  versionLabel: ''
                })
              }}
              formName="templateStageOverview"
              onSubmit={noop}
              validate={validateForm}
              validationSchema={Yup.object().shape({
                name: NameSchema({
                  requiredErrorMsg: getString('pipelineSteps.build.create.stageNameRequiredError')
                }),
                identifier: IdentifierSchema()
              })}
            >
              {(formik: FormikProps<StageElementConfig>) => {
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
                      <Layout.Vertical
                        margin={{ top: 'medium' }}
                        padding={{ top: 'large', bottom: 'large' }}
                        spacing={'large'}
                      >
                        <Heading level={5} color={Color.BLACK}>
                          {getString('templatesLibrary.templateInputs')}
                        </Heading>
                        <StageForm
                          template={{ stage: inputSetTemplate }}
                          allValues={{ stage: formik.values.template?.templateInputs as StageElementConfig }}
                          path={'template.templateInputs'}
                          readonly={isReadonly}
                          viewType={StepViewType.InputSet}
                          hideTitle={true}
                          stageClassName={css.stageCard}
                          allowableTypes={allowableTypes}
                        />
                      </Layout.Vertical>
                    </Container>
                  </FormikForm>
                )
              }}
            </Formik>
          </Container>
        </>
      )}
    </Container>
  )
}
