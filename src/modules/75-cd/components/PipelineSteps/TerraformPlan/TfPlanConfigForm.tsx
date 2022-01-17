/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'

import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  SelectOption,
  Container,
  ButtonVariation
} from '@wings-software/uicore'
import cx from 'classnames'
import { Form, FormikProps } from 'formik'

import { useStrings } from 'framework/strings'

// import * as Yup from 'yup'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import type { Connector, TFPlanConfig } from '../Common/Terraform/TerraformInterfaces'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ConfigFormProps {
  onClick: (values: any) => void
  data?: any
  onHide: (values: any) => void
  isReadonly?: boolean
  allowableTypes: MultiTypeInputType[]
}

export default function ConfigForm(props: ConfigFormProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]
  return (
    <Layout.Vertical>
      <Formik<TFPlanConfig>
        formName="tfPlanConfigForm"
        onSubmit={(values: any) => {
          /*istanbul ignore next*/
          props.onClick(values)
        }}
        initialValues={props.data}
        validationSchema={Yup.object().shape({
          spec: Yup.object().shape({
            configuration: Yup.object().shape({
              configFiles: Yup.object().shape({
                store: Yup.object().shape({
                  spec: Yup.object().shape({
                    connectorRef: Yup.string().required(getString('pipelineSteps.build.create.connectorRequiredError')),
                    gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
                    branch: Yup.string().when('gitFetchType', {
                      is: 'Branch',
                      then: Yup.string().trim().required(getString('validation.branchName'))
                    }),
                    commitId: Yup.string().when('gitFetchType', {
                      is: 'CommitId',
                      then: Yup.string().trim().required(getString('validation.commitId'))
                    }),
                    folderPath: Yup.string().required(getString('pipeline.manifestType.folderPathRequired'))
                  })
                })
              })
            })
          })
        })}
      >
        {(formik: FormikProps<TFPlanConfig>) => {
          const connectorValue = formik.values.spec?.configuration?.configFiles?.store?.spec?.connectorRef as Connector
          return (
            <Layout.Vertical>
              <Form>
                <FormMultiTypeConnectorField
                  label={getString('connector')}
                  type={['Git', 'Github', 'Gitlab', 'Bitbucket']}
                  width={260}
                  name="spec.configuration.configFiles.store.spec.connectorRef"
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  style={{ marginBottom: 10 }}
                  multiTypeProps={{ expressions, allowableTypes: props.allowableTypes }}
                />

                {(connectorValue?.connector?.spec?.connectionType === 'Account' ||
                  connectorValue?.connector?.spec?.type === 'Account') && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.repoName')}
                      name="spec.configuration.configFiles.store.spec.repoName"
                      placeholder={getString('pipelineSteps.repoName')}
                      multiTextInputProps={{ expressions, allowableTypes: props.allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.spec?.configuration?.configFiles?.store?.spec?.repoName) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={formik.values?.spec?.configuration?.configFiles?.store?.spec?.repoName as string}
                        type="String"
                        variableName="configuration.configFiles.store.spec.repoName"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('configuration.configFiles.store.spec.repoName', value)}
                        isReadonly={props.isReadonly}
                      />
                    )}
                  </div>
                )}

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={gitFetchTypes}
                    name="spec.configuration.configFiles.store.spec.gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  />
                </div>

                {formik.values?.spec?.configuration?.configFiles?.store?.spec?.gitFetchType ===
                  gitFetchTypes[0].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name="spec.configuration.configFiles.store.spec.branch"
                      multiTextInputProps={{ expressions, allowableTypes: props.allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.spec?.configuration?.configFiles?.store?.spec?.branch) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={formik.values?.spec?.configuration?.configFiles?.store?.spec?.branch as string}
                        type="String"
                        variableName="configuration.spec.configFiles.store.spec.branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('configuration.configFiles.store.spec.branch', value)}
                        isReadonly={props.isReadonly}
                      />
                    )}
                  </div>
                )}

                {formik.values?.spec?.configuration?.configFiles?.store?.spec?.gitFetchType ===
                  gitFetchTypes[1].value && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name="spec.configuration.configFiles.store.spec.commitId"
                      multiTextInputProps={{ expressions, allowableTypes: props.allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.spec?.configuration?.configFiles?.store?.spec?.commitId) ===
                      MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={formik.values?.spec?.configuration?.configFiles?.store?.spec?.commitId as string}
                        type="String"
                        variableName="spec.configuration.configFiles.store.spec.commitId"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value =>
                          formik.setFieldValue('spec.configuration.configFiles.spec.store.spec.commitId', value)
                        }
                        isReadonly={props.isReadonly}
                      />
                    )}
                  </div>
                )}
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('cd.folderPath')}
                    placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                    name="spec.configuration.configFiles.store.spec.folderPath"
                    multiTextInputProps={{ expressions, allowableTypes: props.allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath) ===
                    MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginTop: 1 }}
                      value={formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath as string}
                      type="String"
                      variableName="formik.values.spec?.configuration?.configFiles?.store.spec?.folderPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value =>
                        formik.setFieldValue(
                          'formik.values.spec?.configuration?.configFiles?.store.spec?.folderPath',
                          value
                        )
                      }
                      isReadonly={props.isReadonly}
                    />
                  )}
                </div>

                <Container padding={{ top: 'xlarge' }} flex width={180}>
                  <Button
                    text={getString('submit')}
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    disabled={!formik?.values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef}
                  />
                  <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={props.onHide} />
                </Container>
              </Form>
            </Layout.Vertical>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
