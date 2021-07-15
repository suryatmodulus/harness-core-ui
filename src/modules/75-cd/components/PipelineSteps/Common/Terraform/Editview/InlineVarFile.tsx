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
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

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

  const { getString } = useStrings()

  return (
    <Dialog
      isOpen={true}
      enforceFocus={false}
      title="Add Inline Terraform Var File"
      isCloseButtonShown
      onClose={onClose}
      className={Classes.DIALOG}
    >
      <Layout.Vertical padding="medium">
        <Formik<InlineVar>
          formName="inlineVarFileForm"
          initialValues={selectedVar}
          onSubmit={(values: any) => {
            /* istanbul ignore next */
            if (!isEditMode) {
              /* istanbul ignore next */
              arrayHelpers && arrayHelpers.push(values)
            } else {
              /* istanbul ignore next */
              arrayHelpers && arrayHelpers.replace(selectedVarIndex, values)
            }
            /* istanbul ignore next */
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
              <FormikForm>
                <div className={stepCss.formGroup}>
                  <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                </div>
                <div className={cx(stepCss.formGroup)}>
                  <MultiTypeFieldSelector
                    name="varFile.spec.content"
                    label={getString('pipelineSteps.content')}
                    defaultValueToReset=""
                    allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                    formik={formikProps}
                    expressionRender={() => {
                      /* istanbul ignore next */
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
