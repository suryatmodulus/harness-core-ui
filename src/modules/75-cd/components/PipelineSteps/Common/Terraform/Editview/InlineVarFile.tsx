import React from 'react'
import * as Yup from 'yup'
import {
  Layout,
  Button,
  FormInput,
  Formik,
  MultiTypeInputType,
  ExpressionInput,
  getMultiTypeFromValue,
  FormikForm
} from '@wings-software/uicore'
import cx from 'classnames'

import { Classes, Dialog } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import { IdentifierSchema } from '@common/utils/Validation'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { InlineVar } from '../TerraformInterfaces'
import { TFMonaco } from './TFMonacoEditor'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface InlineVarFileProps {
  arrayHelpers: any
  isEditMode: boolean
  selectedVarIndex: number
  showTfModal: boolean
  selectedVar: any
  onClose: () => void
  onSubmit: () => void
  isReadonly?: boolean
}

const InlineVarFile = (props: InlineVarFileProps) => {
  const { arrayHelpers, isEditMode, selectedVarIndex, onSubmit, selectedVar, onClose, isReadonly = false } = props
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
              identifier: IdentifierSchema(),
              spec: Yup.object().shape({
                content: Yup.string().required(getString('cd.contentRequired'))
              })
            })
          })}
        >
          {formikProps => {
            return (
              <FormikForm>
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
                      isReadonly={isReadonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup)}>
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
                    <TFMonaco
                      name="varFile.spec.content"
                      formik={formikProps}
                      title={getString('pipelineSteps.content')}
                    />
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
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                  <Button type="submit" intent={'primary'} data-testid="submit-inlinevar">
                    {getString('submit')}
                  </Button>
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Dialog>
  )
}

export default InlineVarFile
