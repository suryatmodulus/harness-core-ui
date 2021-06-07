import React from 'react'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'

import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Text,
  Button,
  SelectOption
} from '@wings-software/uicore'

import cx from 'classnames'

import { Form, FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ConfigFileData, Connector } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ConfigFormProps {
  onClick: (values: any) => void
  data?: any
  onHide: (values: any) => void
}

const gitFetchTypes: SelectOption[] = [
  { label: 'Latest from branch', value: 'Branch' },
  { label: 'Specific Commit ID', value: 'CommitId' }
]

export default function ConfigForm(props: ConfigFormProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  return (
    <Layout.Vertical padding={'huge'}>
      <Formik<ConfigFileData>
        onSubmit={props.onClick}
        initialValues={props.data}
        validationSchema={Yup.object().shape({
          spec: Yup.object().shape({
            configuration: Yup.object().shape({
              spec: Yup.object().shape({
                configFiles: Yup.object().shape({
                  store: Yup.object().shape({
                    spec: Yup.object().shape({
                      connectorRef: Yup.string().required(
                        getString('pipelineSteps.build.create.connectorRequiredError')
                      ),
                      gitFetchType: Yup.string().required(getString('cd.gitFetchTypeRequired')),
                      branch: Yup.string().when('gitFetchType', {
                        is: 'Branch',
                        then: Yup.string().trim().required(getString('validation.branchName'))
                      }),
                      commitId: Yup.string().when('gitFetchType', {
                        is: 'Commit',
                        then: Yup.string().trim().required(getString('validation.commitId'))
                      }),
                      folderPath: Yup.string().required(getString('pipeline.manifestType.folderPathRequired'))
                    })
                  })
                })
              })
            })
          })
        })}
      >
        {(formik: FormikProps<ConfigFileData>) => {
          const connectorValue = formik.values.spec?.configuration?.spec?.configFiles?.store?.spec
            ?.connectorRef as Connector

          return (
            <Form>
              <FormMultiTypeConnectorField
                label={
                  <Text style={{ display: 'flex', alignItems: 'center' }}>
                    {getString('connectors.title.gitConnector')}
                    <Button
                      icon="question"
                      minimal
                      tooltip={getString('connectors.title.gitConnector')}
                      iconProps={{ size: 14 }}
                    />
                  </Text>
                }
                type={['Git', 'Github', 'Gitlab', 'Bitbucket']}
                width={
                  getMultiTypeFromValue(
                    formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
                  ) === MultiTypeInputType.RUNTIME
                    ? 260
                    : 300
                }
                name="spec.configuration.spec.configFiles.store.spec.connectorRef"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                style={{ marginBottom: 10 }}
                multiTypeProps={{ expressions }}
              />

              {(connectorValue?.connector?.spec?.connectionType === 'Account' ||
                connectorValue?.connector?.spec?.type === 'Account') && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('pipelineSteps.repoName')}
                    name="spec.configuration.spec.configFiles.store.spec.repoName"
                    placeholder={getString('pipelineSteps.repoName')}
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(
                    formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.repoName
                  ) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.repoName as string}
                      type="String"
                      variableName="configuration.spec.configFiles.store.spec.repoName"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value =>
                        formik.setFieldValue('configuration.spec.configFiles.store.spec.repoName', value)
                      }
                    />
                  )}
                </div>
              )}

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.Select
                  items={gitFetchTypes}
                  name="spec.configuration.spec.configFiles.store.spec.gitFetchType"
                  label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                />
              </div>

              {formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.gitFetchType ===
                gitFetchTypes[0].value && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('pipelineSteps.deploy.inputSet.branch')}
                    placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                    name="spec.configuration.spec.configFiles.store.spec.branch"
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.branch) ===
                    MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.branch as string}
                      type="String"
                      variableName="configuration.spec.configFiles.store.spec.branch"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value =>
                        formik.setFieldValue('configuration.spec.configFiles.store.spec.branch', value)
                      }
                    />
                  )}
                </div>
              )}

              {formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.gitFetchType ===
                gitFetchTypes[1].value && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('pipeline.manifestType.commitId')}
                    placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                    name="spec.configuration.spec.configFiles.store.spec.commitId"
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(
                    formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.commitId
                  ) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.commitId as string}
                      type="String"
                      variableName="spec.configuration.spec.configFiles.store.spec.commitId"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value =>
                        formik.setFieldValue('spec.configuration.spec.configFiles.spec.store.spec.commitId', value)
                      }
                    />
                  )}
                </div>
              )}
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.MultiTextInput
                  label={getString('cd.folderPath')}
                  placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                  name="spec.configuration.spec.configFiles.store.spec.folderPath"
                  multiTextInputProps={{ expressions }}
                />
                {getMultiTypeFromValue(
                  formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath
                ) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    style={{ alignSelf: 'center' }}
                    value={formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.folderPath as string}
                    type="String"
                    variableName="formik.values.spec?.configuration?.spec?.store.spec?.folderPath"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value =>
                      formik.setFieldValue('formik.values.spec?.configuration?.spec?.store.spec?.folderPath', value)
                    }
                  />
                )}
              </div>

              <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                <Button
                  text={getString('submit')}
                  intent="primary"
                  type="submit"
                  disabled={!formik?.values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef}
                />
                <Button text={getString('cancel')} onClick={props.onHide} />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
