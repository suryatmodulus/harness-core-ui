import React from 'react'
import { Color, Container, Formik, FormInput, Layout, MultiTypeInputType, Text } from '@wings-software/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router'
import { parse } from 'yaml'
import { set } from 'lodash-es'
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
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

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
  const stepType = initialValues.template?.templateInputs.type as StepType
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [inputSetTemplate, setTnputSetTemplate] = React.useState<Partial<StepElementConfig>>()
  const { showError } = useToaster()

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
      setTnputSetTemplate(parse(templateInputYaml?.data || ''))
    } catch (error) {
      showError(error.message, undefined, 'template.parse.inputSet.error')
    }
  }, [templateInputYaml?.data])

  React.useEffect(() => {
    if (inputSetTemplate && !loading) {
      set(initialValues, 'template.templateInputs', inputSetTemplate)
      onUpdate?.(initialValues)
    }
  }, [inputSetTemplate, loading])

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
          <React.Fragment>
            <div className={stepCss.stepPanel}>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier
                  isIdentifierEditable={isNewStep && !readonly}
                  inputLabel={getString('name')}
                  inputGroupProps={{ disabled: readonly }}
                />
              </div>
              <Container>
                {loading && <PageSpinner />}
                {!loading && inputSetError && <PageError message={inputSetError?.message} onClick={() => refetch()} />}
                {!loading && !inputSetError && (
                  <Layout.Vertical
                    margin={{ top: 'medium' }}
                    padding={{ top: 'large', bottom: 'large' }}
                    border={{ top: true }}
                    spacing={'large'}
                  >
                    <Text style={{ fontSize: 16 }} font={{ weight: 'bold' }} color={Color.BLACK}>
                      {getString('templatesLibrary.templateInputs')}
                    </Text>
                    <StepWidget<Partial<StepElementConfig>>
                      factory={factory}
                      initialValues={initialValues.template?.templateInputs || {}}
                      template={inputSetTemplate}
                      readonly={readonly}
                      isNewStep={isNewStep}
                      type={stepType}
                      path={'template.templateInputs'}
                      stepViewType={StepViewType.InputSet}
                      allowableTypes={[
                        MultiTypeInputType.FIXED,
                        MultiTypeInputType.EXPRESSION,
                        MultiTypeInputType.RUNTIME
                      ]}
                    />
                  </Layout.Vertical>
                )}
              </Container>
            </div>
          </React.Fragment>
        )
      }}
    </Formik>
  )
}

export const TemplateStepWidgetWithRef = React.forwardRef(TemplateStepWidget)
