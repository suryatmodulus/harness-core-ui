import React from 'react'
import {
  Color,
  Container,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Heading
} from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { isEmpty, set } from 'lodash-es'
import produce from 'immer'
import { NameSchema } from '@common/utils/Validation'
import { setFormikRef, StepViewType, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { StepElementConfig } from 'services/cd-ng'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { TemplateStepData } from '@pipeline/utils/tempates'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTemplateInputSetYaml } from 'services/template-ng'
import { useToaster } from '@common/exports'
import { PageError } from '@common/components/Page/PageError'
import { PageSpinner } from '@common/components'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TemplateStepWidget.module.scss'

export interface TemplateStepWidgetProps {
  initialValues: TemplateStepData
  isNewStep?: boolean
  isDisabled?: boolean
  onUpdate?: (data: TemplateStepData) => void
  stepViewType?: StepViewType
  readonly?: boolean
  factory: AbstractStepFactory
}

export function TemplateStepWidget(
  props: TemplateStepWidgetProps,
  formikRef: StepFormikFowardRef<TemplateStepData>
): React.ReactElement {
  const { initialValues, factory, onUpdate, isNewStep, readonly } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [inputSetTemplate, setInputSetTemplate] = React.useState<Omit<StepElementConfig, 'name' | 'identifier'>>()
  const { showError } = useToaster()
  const { expressions } = useVariablesExpression()

  const {
    data: templateInputYaml,
    error: inputSetError,
    refetch,
    loading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: initialValues.template?.templateRef || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      versionLabel: initialValues.template?.versionLabel || ''
    }
  })

  React.useEffect(() => {
    try {
      setInputSetTemplate(parse(templateInputYaml?.data || ''))
    } catch (error) {
      showError(error.message, undefined, 'template.parse.inputSet.error')
    }
  }, [templateInputYaml?.data])

  React.useEffect(() => {
    if (!isEmpty(inputSetTemplate) && isEmpty(initialValues.template?.templateInputs)) {
      onUpdate?.(
        produce(initialValues, draft => {
          set(draft, 'template.templateInputs', inputSetTemplate)
        })
      )
    }
  }, [inputSetTemplate])

  return (
    <Formik<TemplateStepData /*TemplateStepFormData*/>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      initialValues={initialValues}
      formName="templateStepWidget"
      validationSchema={Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') })
      })}
      enableReinitialize={true}
    >
      {(formik: FormikProps<TemplateStepData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <div className={stepCss.stepPanel}>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier
                  isIdentifierEditable={isNewStep && !readonly}
                  inputLabel={getString('name')}
                  inputGroupProps={{ disabled: readonly }}
                />
              </div>
              <Container className={css.inputsContainer}>
                {loading && <PageSpinner />}
                {!loading && inputSetError && (
                  <PageError className={css.error} message={inputSetError?.message} onClick={() => refetch()} />
                )}
                {!loading && !inputSetError && inputSetTemplate && formik.values.template?.templateInputs && (
                  <Layout.Vertical
                    margin={{ top: 'medium' }}
                    padding={{ top: 'large', bottom: 'large' }}
                    border={{ top: true }}
                    spacing={'large'}
                  >
                    <Heading level={5} color={Color.BLACK}>
                      {getString('templatesLibrary.templateInputs')}
                    </Heading>
                    <StepWidget<Partial<StepElementConfig>>
                      factory={factory}
                      initialValues={formik.values.template?.templateInputs}
                      template={inputSetTemplate}
                      readonly={readonly}
                      isNewStep={isNewStep}
                      type={initialValues.template?.templateInputs?.type as StepType}
                      path={'template.templateInputs'}
                      stepViewType={StepViewType.InputSet}
                      allowableTypes={[
                        MultiTypeInputType.FIXED,
                        MultiTypeInputType.EXPRESSION,
                        MultiTypeInputType.RUNTIME
                      ]}
                    />
                    {getMultiTypeFromValue(inputSetTemplate?.spec?.delegateSelectors) ===
                      MultiTypeInputType.RUNTIME && (
                      <div className={cx(stepCss.formGroup, stepCss.sm)}>
                        <MultiTypeDelegateSelector
                          expressions={expressions}
                          inputProps={{ projectIdentifier, orgIdentifier }}
                          allowableTypes={[
                            MultiTypeInputType.FIXED,
                            MultiTypeInputType.EXPRESSION,
                            MultiTypeInputType.RUNTIME
                          ]}
                          label={getString('delegate.DelegateSelector')}
                          name={'template.templateInputs.spec.delegateSelectors'}
                          disabled={readonly}
                        />
                      </div>
                    )}
                  </Layout.Vertical>
                )}
              </Container>
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const TemplateStepWidgetWithRef = React.forwardRef(TemplateStepWidget)
