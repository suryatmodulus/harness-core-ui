import React from 'react'
import * as Yup from 'yup'
import {
  Layout,
  Button,
  FormInput,
  Formik,
  MultiTypeInputType,
  ExpressionInput,
  getMultiTypeFromValue
} from '@wings-software/uicore'
import { Classes, Dialog } from '@blueprintjs/core'

import { Form } from 'formik'
import { useStrings } from 'framework/strings'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { InlineVar } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface InlineVarFileProps {
  arrayHelpers: any
  isEditMode: boolean
  selectedVarIndex: number
  showTfModal: boolean
  selectedVar: any
  onClose: () => void
  onSubmit: () => void
}

const InlineVarFile = (props: InlineVarFileProps) => {
  const { arrayHelpers, isEditMode, selectedVarIndex, onSubmit, selectedVar, onClose } = props
  const { expressions } = useVariablesExpression()

  const { getString } = useStrings()

  return (
    <Dialog
      isOpen={true}
      title="Add Inline Terraform Var File"
      isCloseButtonShown
      onClose={onClose}
      className={Classes.DIALOG}
    >
      <Layout.Vertical padding="medium">
        <Formik<InlineVar>
          initialValues={selectedVar}
          onSubmit={(values: any) => {
            if (!isEditMode) {
              arrayHelpers && arrayHelpers.push(values)
            } else {
              arrayHelpers && arrayHelpers.replace(selectedVarIndex, values)
            }
            onSubmit()
          }}
          validationSchema={Yup.object().shape({
            varFile: Yup.object().shape({
              identifier: Yup.string().required(getString('common.validation.identifierIsRequired')),
              spec: Yup.object().shape({
                content: Yup.string().required(getString('cd.contentRequired'))
              })
            })
          })}
        >
          {formikProps => {
            return (
              <Form>
                <div className={stepCss.formGroup}>
                  <FormInput.MultiTextInput
                    name="varFile.identifier"
                    label={getString('identifier')}
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formikProps.values.varFile?.identifier) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formikProps.values.varFile?.identifier as string}
                      type="String"
                      variableName="varFile.identifier"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formikProps.setFieldValue('varFile.identifier', value)}
                    />
                  )}
                </div>
                <div className={stepCss.formGroup}>
                  <MultiTypeFieldSelector
                    name="varFile.spec.content"
                    label={getString('pipelineSteps.content')}
                    defaultValueToReset=""
                    allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                    formik={formikProps}
                    expressionRender={() => {
                      return (
                        <ExpressionInput
                          value={formikProps.values?.varFile?.spec?.content}
                          name="varFile.spec.content"
                          onChange={value => formikProps.setFieldValue('varFile.spec.content', value)}
                        />
                      )
                    }}
                    skipRenderValueInExpressionLabel
                  >
                    <FormInput.TextArea name="varFile.spec.content" />
                  </MultiTypeFieldSelector>
                  {getMultiTypeFromValue(formikProps.values.varFile?.spec?.content) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formikProps.values.varFile?.spec?.content as string}
                      type="String"
                      variableName="varFile.spec.content"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formikProps.setFieldValue('varFile.spec.content', value)}
                    />
                  )}
                </div>
                <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                  <Button type="submit" intent={'primary'} text={getString('submit')} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Dialog>
  )
}

export default InlineVarFile
