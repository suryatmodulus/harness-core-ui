import {
  Button,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  StepProps
} from '@wings-software/uicore'
import React from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'

import { FieldArray, Form } from 'formik'

import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { PathInterface, TerraformStoreTypes } from '../TerraformInterfaces'
import css from './TerraformVarfile.module.scss'
import type { TerraformVarFileWrapper } from 'services/cd-ng'
import { merge } from 'lodash-es'

interface TFRemoteProps {
  onSubmitCallBack: (data: TerraformVarFileWrapper) => void
  isEditMode: boolean
}
export const TFRemoteWizard: React.FC<StepProps<any> & TFRemoteProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isEditMode
}) => {
  const { getString } = useStrings()
  console.log(prevStepData, 'data')
  const initialValues = isEditMode
    ? {
        varFile: {
          identifier: prevStepData?.varFile?.identifier,
          type: TerraformStoreTypes.Remote,
          store: {
            spec: {
              gitFetchType: prevStepData?.varFile?.store?.spec?.gitFetchType,
              branch: prevStepData?.varFile?.store?.spec?.branch,
              commitId: prevStepData?.varFile?.store?.spec?.commitId,
              paths: (prevStepData?.varFile?.store?.spec?.paths || []).map((item: string) => ({
                path: item,
                id: uuid()
              }))
            }
          }
        }
      }
    : {
        varFile: {
          type: TerraformStoreTypes.Remote,
          store: {
            spec: {
              gitFetchType: '',
              branch: '',
              commitId: '',
              paths: []
            }
          }
        }
      }
  const { expressions } = useVariablesExpression()

  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]
  return (
    <Layout.Vertical padding={'huge'} className={css.tfVarStore}>
      <Formik
        initialValues={initialValues}
        onSubmit={values => {
          const payload = merge(prevStepData, values)

          const data = {
            varFile: {
              type: payload.varFile.type,
              identifier: payload.varFile.identifier,
              store: {
                ...payload.varFile.store,
                type: payload?.varFile?.store?.spec?.connectorRef?.connector?.type,
                spec: {
                  ...payload.varFile.store?.spec,
                  connectorRef: payload?.varFile?.store?.spec?.connectorRef
                    ? getMultiTypeFromValue(payload?.varFile?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
                      ? payload?.varFile?.store?.spec?.connectorRef
                      : payload?.varFile?.store?.spec?.connectorRef?.value
                    : ''
                }
              }
            }
          }
          if (payload.varFile.store?.spec?.paths?.length) {
            data.varFile.store.spec['paths'] = payload.varFile.store?.spec?.paths?.map(
              (item: PathInterface) => item.path
            ) as any
          }
          console.log(data, 'data')
          onSubmitCallBack(data)
        }}
        validationSchema={Yup.object().shape({
          varFile: Yup.object().shape({
            identifier: Yup.string().required(getString('common.validation.identifierIsRequired')),
            store: Yup.object().shape({
              spec: Yup.object().shape({
                gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
                branch: Yup.string().when('gitFetchType', {
                  is: 'Branch',
                  then: Yup.string().trim().required(getString('validation.branchName'))
                }),
                commitId: Yup.string().when('gitFetchType', {
                  is: 'Commit',
                  then: Yup.string().trim().required(getString('validation.commitId'))
                }),
                paths: Yup.string().required(getString('cd.pathCannotBeEmpty'))
              })
            })
          })
        })}
      >
        {formik => {
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text name="varFile.identifier" label={getString('cd.fileIdentifier')} />
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={gitFetchTypes}
                    name="varFile.store.spec.gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  />
                </div>
                {formik.values?.varFile?.store?.spec?.gitFetchType === gitFetchTypes[0].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name="varFile.store.spec.branch"
                      multiTextInputProps={{ expressions }}
                    />
                    {getMultiTypeFromValue(formik.values?.varFile?.store?.spec?.branch) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.varFile?.store?.spec?.branch as string}
                        type="String"
                        variableName="varFile.store.spec.branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('varFile.store.spec.branch', value)}
                      />
                    )}
                  </div>
                )}

                {formik.values?.varFile?.store?.spec?.gitFetchType === gitFetchTypes[1].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name="varFile.store.spec.commitId"
                      multiTextInputProps={{ expressions }}
                    />
                    {getMultiTypeFromValue(formik.values?.varFile?.store?.spec?.commitId) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.varFile?.store?.spec?.commitId as string}
                        type="String"
                        variableName="varFile.store.spec.commitId"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('varFile.store.spec.commitId', value)}
                      />
                    )}
                  </div>
                )}
                <MultiTypeFieldSelector
                  name="varFile.store.spec.paths"
                  label={getString('filePaths')}
                  style={{ width: '200' }}
                  disableTypeSelection
                >
                  <FieldArray
                    name="varFile.store.spec.paths"
                    render={({ push, remove }) => {
                      return (
                        <div>
                          {(formik.values?.varFile?.store?.spec?.paths || []).map((path: PathInterface, i: number) => (
                            <div key={`${path}-${i}`} className={css.pathRow}>
                              <FormInput.MultiTextInput name={`varFile.store.spec.paths[${i}].path`} label="" />
                              <Button
                                minimal
                                icon="trash"
                                data-testid={`remove-header-${i}`}
                                onClick={() => remove(i)}
                              />
                            </div>
                          ))}
                          <Button
                            icon="plus"
                            minimal
                            intent="primary"
                            data-testid="add-header"
                            onClick={() => push({ path: '' })}
                          >
                            {getString('pipelineSteps.addTFVarFileLabel')}
                          </Button>
                        </div>
                      )
                    }}
                  />
                </MultiTypeFieldSelector>
              </div>

              <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => previousStep?.()}
                  data-name="tf-remote-back-btn"
                />
                <Button type="submit" intent="primary" text={getString('submit')} rightIcon="chevron-right" />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
