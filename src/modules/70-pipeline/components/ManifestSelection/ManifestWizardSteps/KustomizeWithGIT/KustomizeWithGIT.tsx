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
  StepProps,
  Accordion,
  Icon
} from '@wings-software/uicore'
import cx from 'classnames'
import { Form } from 'formik'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { Tooltip } from '@blueprintjs/core'
import { StringUtils } from '@common/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/exports'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { KustomizeWithGITDataType } from '../../ManifestInterface'
import { gitFetchTypes, GitRepoName, ManifestStoreMap } from '../../Manifesthelper'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface KustomizeWithGITPropType {
  stepName: string
  expressions: string[]
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
}

const KustomizeWithGIT: React.FC<StepProps<ConnectorConfigDTO> & KustomizeWithGITPropType> = ({
  stepName,
  initialValues,
  handleSubmit,
  expressions,
  prevStepData,
  previousStep
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
    if (prevStepData?.connectorRef) {
      if (connectionType === GitRepoName.Repo) {
        repoName = prevStepData?.connectorRef?.connector?.spec?.url
      } else {
        repoName =
          prevStepData?.connectorRef?.connector?.identifier === initialValues?.spec?.store.spec?.connectorRef
            ? initialValues?.spec?.store.spec.repoName
            : ''
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
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              gitFetchType: formData?.gitFetchType,
              repoName: formData?.repoName,
              folderPath: formData?.folderPath
            }
          },
          pluginPath: formData?.pluginPath,
          skipResourceVersioning: formData?.skipResourceVersioning
        }
      }
    }

    if (manifestObj?.manifest?.spec?.store) {
      if (formData?.gitFetchType === 'Branch') {
        manifestObj.manifest.spec.store.spec.branch = formData?.branch
      } else if (formData?.gitFetchType === 'Commit') {
        manifestObj.manifest.spec.store.spec.commitId = formData?.commitId
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
          folderPath: Yup.string().trim().required(getString('pipeline.manifestType.kustomizePathRequired'))
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
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
        {(formik: { setFieldValue: (a: string, b: string) => void; values: KustomizeWithGITDataType }) => (
          <Form>
            <div className={helmcss.helmGitForm}>
              <FormInput.Text
                name="identifier"
                label={getString('pipeline.manifestType.manifestIdentifier')}
                placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                className={helmcss.halfWidth}
              />
              {connectionType === GitRepoName.Repo && (
                <div className={helmcss.halfWidth}>
                  <FormInput.Text
                    label={getString('pipelineSteps.build.create.repositoryNameLabel')}
                    disabled
                    name="repoName"
                  />
                </div>
              )}

              {!!(connectionType === GitRepoName.Account && accountUrl) && (
                <div className={helmcss.halfWidth}>
                  <div>
                    <FormInput.Text
                      label={getString('pipelineSteps.build.create.repositoryNameLabel')}
                      name="repoName"
                      className={helmcss.repoName}
                    />
                  </div>
                  <div
                    style={{ marginBottom: 'var(--spacing-medium)' }}
                  >{`${accountUrl}/${formik.values?.repoName}`}</div>
                </div>
              )}
              <Layout.Horizontal flex spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                <div className={helmcss.halfWidth}>
                  <FormInput.Select
                    name="gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    items={gitFetchTypes}
                  />
                </div>

                {formik.values?.gitFetchType === gitFetchTypes[0].value && (
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
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

                {formik.values?.gitFetchType === gitFetchTypes[1].value && (
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
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

              <Layout.Horizontal flex spacing="huge" margin={{ bottom: 'small' }}>
                <div
                  className={cx(helmcss.folderPath, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('pipeline.manifestType.kustomizeFolderPath')}
                    placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                    name="folderPath"
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.folderPath as string}
                      type="String"
                      variableName="folderPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('folderPath', value)}
                    />
                  )}
                  <Tooltip
                    position="top"
                    content={
                      <div className={helmcss.tooltipContent}>
                        {getString('pipeline.manifestType.kustomizePathHelperText')}{' '}
                      </div>
                    }
                    className={helmcss.tooltip}
                  >
                    <Icon name="info-sign" color={Color.BLUE_450} size={16} />
                  </Tooltip>
                </div>

                <div
                  className={cx(helmcss.folderPath, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.pluginPath) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('pluginPath')}
                    placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                    name="pluginPath"
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formik.values?.pluginPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.pluginPath as string}
                      type="String"
                      variableName="pluginPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('pluginPath', value)}
                    />
                  )}
                  <Tooltip
                    position="top"
                    content={
                      <div className={helmcss.tooltipContent}>
                        {getString('pipeline.manifestType.pluginPathHelperText')}{' '}
                      </div>
                    }
                    className={helmcss.tooltip}
                  >
                    <Icon name="info-sign" color={Color.BLUE_450} size={16} />
                  </Tooltip>
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
                    <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                      <FormMultiTypeCheckboxField
                        name="skipResourceVersioning"
                        label={getString('skipResourceVersion')}
                        multiTypeTextbox={{ expressions }}
                        className={cx(helmcss.checkbox, helmcss.halfWidth)}
                      />
                      <Tooltip
                        position="top"
                        content={
                          <div className={helmcss.tooltipContent}>
                            {getString('pipeline.manifestType.helmSkipResourceVersion')}{' '}
                          </div>
                        }
                        className={helmcss.tooltip}
                      >
                        <Icon name="info-sign" color={Color.BLUE_450} size={16} />
                      </Tooltip>
                    </Layout.Horizontal>
                  }
                />
              </Accordion>
            </div>

            <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
              <Button text={getString('back')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
              <Button intent="primary" type="submit" text={getString('submit')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default KustomizeWithGIT
