import React from 'react'
import {
  Layout,
  Button,
  FormInput,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  StepProps,
  Accordion,
  ButtonVariation,
  FontVariation
} from '@wings-software/uicore'
import cx from 'classnames'
import { Form } from 'formik'
import * as Yup from 'yup'
import { get, isEmpty, set } from 'lodash-es'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { FormMultiTypeCheckboxField } from '@common/components'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import type { KustomizeWithGITDataType } from '../../ManifestInterface'
import {
  gitFetchTypeList,
  GitFetchTypes,
  GitRepoName,
  ManifestDataType,
  ManifestIdentifierValidation,
  ManifestStoreMap
} from '../../Manifesthelper'
import GitRepositoryName from '../GitRepositoryName/GitRepositoryName'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface KustomizeWithGITPropType {
  stepName: string
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
}

const KustomizeWithGIT: React.FC<StepProps<ConnectorConfigDTO> & KustomizeWithGITPropType> = ({
  stepName,
  initialValues,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  previousStep,
  manifestIdsList,
  isReadonly = false
}) => {
  const { getString } = useStrings()

  const isActiveAdvancedStep: boolean = initialValues?.spec?.skipResourceVersioning || initialValues?.spec?.commandFlags
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
    if (getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED) {
      repoName = prevStepData?.connectorRef
    } else if (prevStepData?.connectorRef) {
      if (connectionType === GitRepoName.Repo) {
        repoName = prevStepData?.connectorRef?.connector?.spec?.url
      } else {
        const connectorScope = getScopeFromValue(initialValues?.spec?.store?.spec?.connectorRef)
        if (connectorScope === Scope.ACCOUNT) {
          if (
            initialValues?.spec?.store.spec?.connectorRef ===
            `account.${prevStepData?.connectorRef?.connector?.identifier}`
          ) {
            repoName = initialValues?.spec?.store?.spec?.repoName
          } else {
            repoName = ''
          }
        } else {
          repoName =
            prevStepData?.connectorRef?.connector?.identifier === initialValues?.spec?.store?.spec?.connectorRef
              ? initialValues?.spec?.store?.spec?.repoName
              : ''
        }
      }
      return repoName
    }
    return repoName
  }

  const getInitialValues = React.useCallback((): KustomizeWithGITDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      const values = {
        ...specValues,
        identifier: initialValues.identifier,
        folderPath: specValues.folderPath,
        repoName: getRepoName(),
        pluginPath: initialValues.spec?.pluginPath,
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning
      }
      return values
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: '',
      skipResourceVersioning: false,
      repoName: getRepoName(),
      pluginPath: ''
    }
  }, [])

  const submitFormData = (formData: KustomizeWithGITDataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: ManifestDataType.Kustomize,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              gitFetchType: formData?.gitFetchType,
              folderPath: formData?.folderPath
            }
          },
          pluginPath: formData?.pluginPath,
          skipResourceVersioning: formData?.skipResourceVersioning
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
    <Layout.Vertical spacing="medium" className={css.manifestStore}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="kustomizeGit"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(
            manifestIdsList,
            initialValues?.identifier,
            getString('pipeline.uniqueIdentifier')
          ),
          folderPath: Yup.string().trim().required(getString('pipeline.manifestType.kustomizeFolderPathRequired')),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          repoName: Yup.string().test('repoName', getString('common.validation.repositoryName'), value => {
            if (
              connectionType === GitRepoName.Repo ||
              getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED
            ) {
              return true
            }
            return !isEmpty(value) && value?.length > 0
          })
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorRef: prevStepData?.connectorRef
              ? getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED
                ? prevStepData?.connectorRef
                : prevStepData?.connectorRef?.value
              : prevStepData?.identifier
              ? prevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: KustomizeWithGITDataType }) => (
          <Form>
            <div className={helmcss.helmGitForm}>
              <FormInput.Text
                name="identifier"
                label={getString('pipeline.manifestType.manifestIdentifier')}
                placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                className={helmcss.halfWidth}
              />

              {!!(connectionType === GitRepoName.Account && accountUrl) && (
                <GitRepositoryName
                  accountUrl={accountUrl}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  fieldValue={formik.values?.repoName}
                  changeFieldValue={(value: string) => formik.setFieldValue('repoName', value)}
                  isReadonly={isReadonly}
                />
              )}

              <Layout.Horizontal flex spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                <div className={helmcss.halfWidth}>
                  <FormInput.Select
                    name="gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    items={gitFetchTypeList}
                  />
                </div>

                {formik.values?.gitFetchType === GitFetchTypes.Branch && (
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                      name="branch"
                    />
                    {getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginBottom: 4 }}
                        value={formik.values?.branch as string}
                        type="String"
                        variableName="branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('branch', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}

                {formik.values?.gitFetchType === GitFetchTypes.Commit && (
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                      name="commitId"
                    />
                    {getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginBottom: 4 }}
                        value={formik.values?.commitId as string}
                        type="String"
                        variableName="commitId"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('commitId', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge" margin={{ bottom: 'small' }}>
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('pipeline.manifestType.kustomizeFolderPath')}
                    placeholder={getString('pipeline.manifestType.kustomizeFolderPathPlaceholder')}
                    name="folderPath"
                    tooltipProps={{
                      dataTooltipId: 'kustomizePathHelperText'
                    }}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginBottom: 4 }}
                      value={formik.values?.folderPath as string}
                      type="String"
                      variableName="folderPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('folderPath', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.pluginPath) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('pluginPath')}
                    placeholder={getString('pipeline.manifestType.kustomizePluginPathPlaceholder')}
                    name="pluginPath"
                    tooltipProps={{
                      dataTooltipId: 'pluginPathHelperText'
                    }}
                    isOptional={true}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values?.pluginPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginBottom: 4 }}
                      value={formik.values?.pluginPath as string}
                      type="String"
                      variableName="pluginPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('pluginPath', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>
              </Layout.Horizontal>
              <Accordion
                activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''}
                className={cx({
                  [helmcss.skipResourceSection]: isActiveAdvancedStep
                })}
              >
                <Accordion.Panel
                  id={getString('advancedTitle')}
                  addDomId={true}
                  summary={getString('advancedTitle')}
                  details={
                    <Layout.Horizontal
                      flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
                      margin={{ bottom: 'huge' }}
                    >
                      <FormMultiTypeCheckboxField
                        name="skipResourceVersioning"
                        label={getString('skipResourceVersion')}
                        multiTypeTextbox={{ expressions, allowableTypes }}
                        tooltipProps={{
                          dataTooltipId: 'helmSkipResourceVersion'
                        }}
                        className={cx(helmcss.checkbox, helmcss.halfWidth)}
                      />
                      {getMultiTypeFromValue(formik.values?.skipResourceVersioning) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={(formik.values?.skipResourceVersioning || '') as string}
                          type="String"
                          variableName="skipResourceVersioning"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => formik.setFieldValue('skipResourceVersioning', value)}
                          style={{ alignSelf: 'center', marginTop: 11 }}
                          className={css.addmarginTop}
                          isReadonly={isReadonly}
                        />
                      )}
                    </Layout.Horizontal>
                  }
                />
              </Accordion>
            </div>

            <Layout.Horizontal spacing="medium" className={css.saveBtn}>
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
                icon="chevron-left"
                onClick={() => previousStep?.(prevStepData)}
              />
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('submit')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default KustomizeWithGIT
