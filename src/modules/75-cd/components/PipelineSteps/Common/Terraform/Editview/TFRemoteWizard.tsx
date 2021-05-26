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
import { merge } from 'lodash-es'
import { FieldArray, Form } from 'formik'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { PathInterface, RemoteVar, TerraformStoreTypes } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './TerraformVarfile.module.scss'

interface TFRemoteProps {
  onSubmitCallBack: (data: RemoteVar) => void
  isEditMode: boolean
}
export const TFRemoteWizard: React.FC<StepProps<any> & TFRemoteProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isEditMode
}) => {
  const { getString } = useStrings()
  const initialValues = isEditMode
    ? {
        varFile: {
          identifier: prevStepData?.varFile?.identifier,
          type: TerraformStoreTypes.Remote,
          spec: {
            store: {
              spec: {
                gitFetchType: prevStepData?.varFile?.spec?.store?.spec?.gitFetchType,
                branch: prevStepData?.varFile?.spec?.store?.spec?.branch,
                commitId: prevStepData?.varFile?.spec?.store?.spec?.commitId,
                paths:
                  getMultiTypeFromValue(prevStepData?.varFile?.spec?.store?.spec?.paths) === MultiTypeInputType.RUNTIME
                    ? prevStepData?.varFile?.spec?.store?.spec?.paths
                    : (prevStepData?.varFile?.spec?.store?.spec?.paths || []).map((item: string) => ({
                        path: item,
                        id: uuid()
                      }))
              }
            }
          }
        }
      }
    : {
        varFile: {
          type: TerraformStoreTypes.Remote,
          spec: {
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
              spec: {
                store: {
                  type: payload?.varFile?.spec?.store?.spec?.connectorRef?.connector?.type,
                  spec: {
                    ...payload.varFile.spec?.store?.spec,
                    connectorRef: payload?.varFile?.spec?.store?.spec?.connectorRef
                      ? getMultiTypeFromValue(payload?.varFile?.spec?.store?.spec?.connectorRef) ===
                        MultiTypeInputType.RUNTIME
                        ? payload?.varFile?.spec?.store?.spec?.connectorRef
                        : payload?.varFile?.spec?.store?.spec?.connectorRef?.value
                      : ''
                  }
                }
              }
            }
          }
          if (payload.varFile.spec?.store?.spec?.gitFetchType === gitFetchTypes[0].value) {
            delete data?.varFile?.spec?.store?.spec?.commitId
          } else if (payload.varFile.spec?.store?.spec?.gitFetchType === gitFetchTypes[1].value) {
            delete data?.varFile?.spec?.store?.spec?.branch
          }
          if (
            getMultiTypeFromValue(payload.varFile.spec?.store?.spec?.paths) === MultiTypeInputType.FIXED &&
            payload.varFile.spec?.store?.spec?.paths?.length
          ) {
            data.varFile.spec.store.spec['paths'] = payload.varFile.spec?.store?.spec?.paths?.map(
              (item: PathInterface) => item.path
            ) as any
          } else if (getMultiTypeFromValue(payload.varFile.spec?.store?.spec?.paths) === MultiTypeInputType.RUNTIME) {
            data.varFile.spec.store.spec['paths'] = payload.varFile.spec?.store?.spec?.paths
          }
          onSubmitCallBack(data)
        }}
        validationSchema={Yup.object().shape({
          varFile: Yup.object().shape({
            identifier: Yup.string().required(getString('common.validation.identifierIsRequired')),
            spec: Yup.object().shape({
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
          })
        })}
      >
        {formik => {
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    name="varFile.identifier"
                    label={getString('identifier')}
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formik.values.varFile?.identifier) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.varFile?.identifier as string}
                      type="String"
                      variableName="varFile.identifier"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('varFile.identifier', value)}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={gitFetchTypes}
                    name="varFile.spec.store.spec.gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  />
                </div>
                {formik.values?.varFile?.spec?.store?.spec?.gitFetchType === gitFetchTypes[0].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name="varFile.spec.store.spec.branch"
                      multiTextInputProps={{ expressions }}
                    />
                    {getMultiTypeFromValue(formik.values?.varFile?.spec?.store?.spec?.branch) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.varFile?.spec?.store?.spec?.branch as string}
                        type="String"
                        variableName="varFile.spec.store.spec.branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('varFile.spec.store.spec.branch', value)}
                      />
                    )}
                  </div>
                )}

                {formik.values?.varFile?.spec?.store?.spec?.gitFetchType === gitFetchTypes[1].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name="varFile.spec.store.spec.commitId"
                      multiTextInputProps={{ expressions }}
                    />
                    {getMultiTypeFromValue(formik.values?.varFile?.spec?.store?.spec?.commitId) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.varFile?.spec?.store?.spec?.commitId as string}
                        type="String"
                        variableName="varFile.spec.store.spec.commitId"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('varFile.spec.store.spec.commitId', value)}
                      />
                    )}
                  </div>
                )}
                <MultiTypeFieldSelector
                  name="varFile.spec.store.spec.paths"
                  label={getString('filePaths')}
                  style={{ width: '200' }}
                >
                  <FieldArray
                    name="varFile.spec.store.spec.paths"
                    render={({ push, remove }) => {
                      return (
                        <div>
                          {(formik.values?.varFile?.spec?.store?.spec?.paths || []).map(
                            (path: PathInterface, i: number) => (
                              <div key={`${path}-${i}`} className={css.pathRow}>
                                <FormInput.MultiTextInput
                                  name={`varFile.spec.store.spec.paths[${i}].path`}
                                  label=""
                                  multiTextInputProps={{
                                    expressions,
                                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                                  }}
                                />
                                <Button
                                  minimal
                                  icon="trash"
                                  data-testid={`remove-header-${i}`}
                                  onClick={() => remove(i)}
                                />
                              </div>
                            )
                          )}
                          <Button
                            icon="plus"
                            minimal
                            intent="primary"
                            data-testid="add-header"
                            onClick={() => push({ path: '' })}
                          >
                            {getString('cd.addTFVarFileLabel')}
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
