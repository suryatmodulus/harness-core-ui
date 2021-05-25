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

import { get, isEmpty, set } from 'lodash-es'
import { StringUtils } from '@common/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'

import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { OpenShiftParamDataType } from '../../ManifestInterface'
import { gitFetchTypeList, GitFetchTypes, GitRepoName, ManifestStoreMap } from '../../Manifesthelper'
import GitRepositoryName from '../GitRepositoryName/GitRepositoryName'
import css from '../ManifestWizardSteps.module.scss'
import templateCss from './OpenShiftParam.module.scss'
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
    if (getMultiTypeFromValue(prevStepData?.connectorRef) === MultiTypeInputType.RUNTIME) {
      repoName = prevStepData?.connectorRef
    } else if (prevStepData?.connectorRef) {
      const connectorScope = getScopeFromValue(initialValues?.spec?.store.spec?.connectorRef)
      if (connectorScope === Scope.ACCOUNT) {
        if (
          initialValues?.spec?.store.spec?.connectorRef ===
          `account.${prevStepData?.connectorRef?.connector?.identifier}`
        ) {
          repoName = initialValues?.spec?.store.spec.repoName
        } else {
          repoName = ''
        }
      } else {
        repoName =
          prevStepData?.connectorRef?.connector?.identifier === initialValues?.spec?.store.spec?.connectorRef
            ? initialValues?.spec?.store.spec.repoName
            : ''
      }
      return repoName
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
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              gitFetchType: formData?.gitFetchType,
              paths: formData?.paths
            }
          }
        }
      }
    }

    if (connectionType === GitRepoName.Account) {
      set(manifestObj, 'manifest.spec.store.spec.repoName', formData?.repoName)
    }

    if (manifestObj?.manifest?.spec?.store) {
      if (formData?.gitFetchType === 'Branch') {
        set(manifestObj, 'manifest.spec.store.spec.branch', formData?.branch)
      } else if (formData?.gitFetchType === 'Commit') {
        set(manifestObj, 'manifest.spec.store.spec.commitId', formData?.commitId)
      }
    }
    handleSubmit(manifestObj)
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
          }),
          repoName: Yup.string().test('repoName', getString('pipeline.manifestType.reponameRequired'), value => {
            if (connectionType === GitRepoName.Repo) {
              return true
            }
            return !isEmpty(value) && value?.length > 0
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
                label={getString('pipeline.manifestType.manifestIdentifier')}
                placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                className={templateCss.halfWidth}
              />

              {!!(connectionType === GitRepoName.Account && accountUrl) && (
                <GitRepositoryName
                  accountUrl={accountUrl}
                  expressions={expressions}
                  fieldValue={formik.values?.repoName}
                  changeFieldValue={(value: string) => formik.setFieldValue('repoName', value)}
                />
              )}

              <Layout.Horizontal flex spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                <div className={templateCss.halfWidth}>
                  <FormInput.Select
                    name="gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    items={gitFetchTypeList}
                  />
                </div>

                {formik.values?.gitFetchType === GitFetchTypes.Branch && (
                  <div
                    className={cx(templateCss.halfWidth, {
                      [templateCss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
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

                {formik.values?.gitFetchType === GitFetchTypes.Commit && (
                  <div
                    className={cx(templateCss.halfWidth, {
                      [templateCss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
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

              <MultiTypeList
                name="paths"
                multiTypeFieldSelectorProps={{
                  label: (
                    <Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipelineSteps.paths')}</Text>
                  )
                }}
                style={{ marginBottom: 'var(--spacing-small)', height: '350', width: '400px' }}
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
