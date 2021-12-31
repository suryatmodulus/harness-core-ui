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
  Heading,
  PageError
} from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { defaultTo, isEqual, merge, set } from 'lodash-es'
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
import { PageSpinner } from '@common/components'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
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
  allowableTypes: MultiTypeInputType[]
}

export function TemplateStepWidget(
  props: TemplateStepWidgetProps,
  formikRef: StepFormikFowardRef<TemplateStepData>
): React.ReactElement {
  const { initialValues, factory, onUpdate, isNewStep, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [inputSetTemplate, setInputSetTemplate] = React.useState<Omit<StepElementConfig, 'name' | 'identifier'>>()
  const { showError } = useToaster()
  const { expressions } = useVariablesExpression()
  const templateRef = getIdentifierFromValue(initialValues.template.templateRef)
  const scope = getScopeFromValue(initialValues.template.templateRef)

  const {
    data: templateInputYaml,
    error: inputSetError,
    refetch,
    loading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: templateRef,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      versionLabel: initialValues.template.versionLabel || ''
    }
  })

  React.useEffect(() => {
    if (!loading) {
      try {
        const templateInputs = parse(defaultTo(templateInputYaml?.data, ''))
        setInputSetTemplate(templateInputs)
        if (!isEqual(templateInputs, initialValues.template?.templateInputs)) {
          set(
            initialValues,
            'template.templateInputs',
            merge({}, templateInputs, initialValues.template?.templateInputs)
          )
          onUpdate?.(initialValues)
        }
      } catch (error) {
        showError(error.message, undefined, 'template.parse.inputSet.error')
      }
    }
  }, [templateInputYaml?.data, loading])

  return (
    <div className={stepCss.stepPanel}>
      {loading && <PageSpinner />}
      {!loading && inputSetError && (
        <PageError
          className={css.error}
          message={defaultTo((inputSetError.data as Error)?.message, inputSetError.message)}
          onClick={() => refetch()}
        />
      )}
      {!loading && !inputSetError && inputSetTemplate && initialValues.template?.templateInputs && (
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
                <Container className={css.inputsContainer}>
                  <Layout.Vertical
                    margin={{ top: 'medium' }}
                    padding={{ top: 'large', bottom: 'large' }}
                    border={{ top: true }}
                    spacing={'large'}
                  >
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.InputWithIdentifier
                        isIdentifierEditable={isNewStep && !readonly}
                        inputLabel={getString('name')}
                        inputGroupProps={{ disabled: readonly }}
                      />
                    </div>
                    <Heading level={5} color={Color.BLACK}>
                      {getString('templatesLibrary.templateInputs')}
                    </Heading>
                    <StepWidget<Partial<StepElementConfig>>
                      factory={factory}
                      initialValues={formik.values.template?.templateInputs || {}}
                      template={inputSetTemplate}
                      readonly={readonly}
                      isNewStep={isNewStep}
                      type={initialValues.template?.templateInputs?.type as StepType}
                      path={'template.templateInputs'}
                      stepViewType={StepViewType.InputSet}
                      allowableTypes={allowableTypes}
                    />
                    {getMultiTypeFromValue(inputSetTemplate?.spec?.delegateSelectors) ===
                      MultiTypeInputType.RUNTIME && (
                      <div className={cx(stepCss.formGroup, stepCss.sm)}>
                        <MultiTypeDelegateSelector
                          expressions={expressions}
                          inputProps={{ projectIdentifier, orgIdentifier }}
                          allowableTypes={allowableTypes}
                          label={getString('delegate.DelegateSelector')}
                          name={'template.templateInputs.spec.delegateSelectors'}
                          disabled={readonly}
                        />
                      </div>
                    )}
                  </Layout.Vertical>
                </Container>
              </FormikForm>
            )
          }}
        </Formik>
      )}
    </div>
  )
}

export const TemplateStepWidgetWithRef = React.forwardRef(TemplateStepWidget)
