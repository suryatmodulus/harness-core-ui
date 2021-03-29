import React from 'react'
import {
  Layout,
  Button,
  Text,
  FormInput,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Color,
  StepProps
} from '@wings-software/uicore'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { Form } from 'formik'
import * as Yup from 'yup'

import { get } from 'lodash-es'
import { StringUtils } from '@common/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/exports'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'

import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import type { OpenShiftParamDataType } from '../../ManifestInterface'
import { gitFetchTypes, GitRepoName, ManifestStoreMap } from '../../Manifesthelper'
import css from '../ManifestWizardSteps.module.scss'
import templateCss from './OpenShiftParam.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
interface OpenshiftTemplateWithGITPropType {
  stepName: string
  expressions: string[]
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
}

const OpenShiftParamWithGit: React.FC<StepProps<ConnectorConfigDTO> & OpenshiftTemplateWithGITPropType> = ({
  stepName,
  initialValues,
  handleSubmit,
  expressions,
  prevStepData,
  previousStep
}) => {
  const { getString } = useStrings()
  const gitConnectionType: string = prevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const accountUrl =
    connectionType === GitRepoName.Account
      ? prevStepData?.connectorRef
        ? prevStepData?.connectorRef?.connector?.spec?.url
        : prevStepData?.url
      : null

  const getRepoName = (): string => {
    let repoName = ''
    if (prevStepData?.connectorRef) {
      if (connectionType === GitRepoName.Repo) {
        repoName = prevStepData?.connectorRef?.connector?.spec?.url
      } else {
        repoName = initialValues?.spec?.store.spec.repoName || ''
      }
      return repoName
    }

    if (prevStepData?.identifier) {
      if (connectionType === GitRepoName.Repo) {
        repoName = prevStepData?.url
      }
    }
    return repoName
  }

  const getInitialValues = React.useCallback((): OpenShiftParamDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      const pathArray = specValues.paths.map((path: string) => ({
        id: uuid('', nameSpace()),
        value: path
      }))

      const values = {
        ...specValues,
        identifier: initialValues.identifier,
        paths: pathArray,
        repoName: getRepoName()
      }
      return values
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: [],
      repoName: getRepoName()
    }
  }, [])

  const submitFormData = (formData: OpenShiftParamDataType & { store?: string; connectorRef?: string }): void => {
    if (prevStepData?.store === ManifestStoreMap.Git) {
      const manifestObj: ManifestConfigWrapper = {
        manifest: {
          identifier: formData.identifier,
          spec: {
            store: {
              type: formData?.store,
              spec: {
                connectorRef: formData?.connectorRef,
                gitFetchType: formData?.gitFetchType,
                branch: formData?.branch,
                commitId: formData?.commitId,
                repoName: formData?.repoName,
                paths: formData?.paths
              }
            }
          }
        }
      }
      handleSubmit(manifestObj)
    } else {
      const manifestObj: ManifestConfigWrapper = {
        manifest: {
          identifier: formData.identifier,
          spec: {
            store: {
              type: formData?.store,
              spec: {
                connectorRef: formData?.connectorRef,
                paths: formData?.paths
              }
            }
          }
        }
      }
      handleSubmit(manifestObj)
    }
  }
  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      <Text font="large" color={Color.GREY_800}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={Yup.object().shape({
          identifier: Yup.string()
            .trim()
            .required(getString('validation.identifierRequired'))
            .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
            .notOneOf(StringUtils.illegalIdentifiers),

          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          })
        })}
        onSubmit={formData => {
          const paths = formData?.paths?.map((path: any) => path.value)
          submitFormData({
            ...prevStepData,
            ...formData,
            paths,
            connectorRef: prevStepData?.connectorRef
              ? getMultiTypeFromValue(prevStepData?.connectorRef) === MultiTypeInputType.RUNTIME
                ? prevStepData?.connectorRef
                : prevStepData?.connectorRef?.value
              : prevStepData?.identifier
              ? prevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: OpenShiftParamDataType }) => (
          <Form>
            <div className={templateCss.templateForm}>
              <FormInput.Text
                name="identifier"
                label={getString('manifestType.manifestIdentifier')}
                placeholder={getString('manifestType.manifestPlaceholder')}
                className={templateCss.halfWidth}
              />
              {connectionType === GitRepoName.Repo && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text
                    label={getString('pipelineSteps.build.create.repositoryNameLabel')}
                    disabled
                    name="repoName"
                    style={{ width: '370px' }}
                  />
                </div>
              )}

              {!!(connectionType === GitRepoName.Account && accountUrl) && (
                <div className={templateCss.halfWidth}>
                  <div>
                    <FormInput.Text
                      label={getString('pipelineSteps.build.create.repositoryNameLabel')}
                      name="repoName"
                      className={templateCss.repoName}
                    />
                  </div>
                  <div
                    style={{ marginBottom: 'var(--spacing-medium)' }}
                  >{`${accountUrl}/${formik.values?.repoName}`}</div>
                </div>
              )}
              {prevStepData?.store === ManifestStoreMap.Git && (
                <Layout.Horizontal flex spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                  <div className={templateCss.halfWidth}>
                    <FormInput.Select
                      name="gitFetchType"
                      label={getString('manifestType.gitFetchTypeLabel')}
                      items={gitFetchTypes}
                    />
                  </div>

                  {formik.values?.gitFetchType === gitFetchTypes[0].value && (
                    <div
                      className={cx(templateCss.halfWidth, {
                        [templateCss.runtimeInput]:
                          getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME
                      })}
                    >
                      <FormInput.MultiTextInput
                        label={getString('pipelineSteps.deploy.inputSet.branch')}
                        placeholder={getString('manifestType.branchPlaceholder')}
                        multiTextInputProps={{ expressions }}
                        name="branch"
                      />
                      {getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center' }}
                          value={formik.values?.branch as string}
                          type="String"
                          variableName="branch"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => formik.setFieldValue('branch', value)}
                        />
                      )}
                    </div>
                  )}

                  {formik.values?.gitFetchType === gitFetchTypes[1].value && (
                    <div
                      className={cx(templateCss.halfWidth, {
                        [templateCss.runtimeInput]:
                          getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME
                      })}
                    >
                      <FormInput.MultiTextInput
                        label={getString('manifestType.commitId')}
                        placeholder={getString('manifestType.commitPlaceholder')}
                        multiTextInputProps={{ expressions }}
                        name="commitId"
                      />
                      {getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center' }}
                          value={formik.values?.commitId as string}
                          type="String"
                          variableName="commitId"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => formik.setFieldValue('commitId', value)}
                        />
                      )}
                    </div>
                  )}
                </Layout.Horizontal>
              )}

              <MultiTypeList
                name="paths"
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipelineSteps.paths')}</Text>
                  )
                }}
                style={{ marginBottom: 'var(--spacing-small)', height: '350' }}
              />
            </div>

            <Layout.Horizontal spacing="xxlarge" margin={{ top: 'huge' }}>
              <Button text={getString('back')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
              <Button intent="primary" type="submit" text={getString('submit')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default OpenShiftParamWithGit
