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
  Icon,
  Accordion
} from '@wings-software/uicore'
import cx from 'classnames'
import { Form } from 'formik'
import * as Yup from 'yup'
import { Tooltip } from '@blueprintjs/core'

import { get } from 'lodash-es'
import { StringUtils } from '@common/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeCheckboxField } from '@common/components'
import { useStrings } from 'framework/exports'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import i18n from '../ManifestWizard.i18n'
import type { OpenShiftTemplateGITDataType } from '../../ManifestInterface'
import { GitRepoName, ManifestStoreMap } from '../../Manifesthelper'
import css from '../ManifestWizardSteps.module.scss'
import templateCss from './OSTemplateWithGit.module.scss'

const gitFetchTypes = [
  { label: i18n.gitFetchTypes[0].label, value: 'Branch' },
  { label: i18n.gitFetchTypes[1].label, value: 'Commit' }
]

interface OpenshiftTemplateWithGITPropType {
  stepName: string
  expressions: string[]
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
}

const OpenShiftTemplateWithGit: React.FC<StepProps<ConnectorConfigDTO> & OpenshiftTemplateWithGITPropType> = ({
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

  const getInitialValues = React.useCallback((): OpenShiftTemplateGITDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      const values = {
        ...specValues,
        identifier: initialValues.identifier,
        paths: specValues.paths,
        repoName: getRepoName(),
        path: specValues.paths[0],
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning
      }
      return values
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      path: '',
      skipResourceVersioning: false,
      repoName: getRepoName()
    }
  }, [])

  const submitFormData = (formData: OpenShiftTemplateGITDataType & { store?: string; connectorRef?: string }): void => {
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
              paths: [formData?.path]
            }
          },
          skipResourceVersioning: formData?.skipResourceVersioning
        }
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
            .required(i18n.validation.identifier)
            .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, i18n.STEP_TWO.manifestIdentifier)
            .notOneOf(StringUtils.illegalIdentifiers),
          path: Yup.string().trim().required(getString('manifestType.folderPathRequired'))
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
        {(formik: { setFieldValue: (a: string, b: string) => void; values: OpenShiftTemplateGITDataType }) => (
          <Form>
            <div className={templateCss.templateForm}>
              <FormInput.Text
                name="identifier"
                label={getString('manifestType.manifestIdentifier')}
                placeholder={getString('manifestType.manifestPlaceholder')}
                className={templateCss.halfWidth}
              />
              {connectionType === GitRepoName.Repo && (
                <div>
                  <FormInput.Text
                    label={getString('pipelineSteps.build.create.repositoryNameLabel')}
                    disabled
                    name="repoName"
                  />
                </div>
              )}

              {connectionType === GitRepoName.Account && (
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
              <Layout.Horizontal flex spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                <div className={templateCss.halfWidth}>
                  <FormInput.Select name="gitFetchType" label={i18n.STEP_TWO.gitFetchTypeLabel} items={gitFetchTypes} />
                </div>

                {formik.values?.gitFetchType === gitFetchTypes[0].value && (
                  <div
                    className={cx(templateCss.halfWidth, {
                      [templateCss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTextInput
                      label={i18n.STEP_TWO.branchLabel}
                      placeholder={i18n.STEP_TWO.branchPlaceholder}
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
                      label={i18n.STEP_TWO.commitLabel}
                      multiTextInputProps={{ expressions }}
                      placeholder={i18n.STEP_TWO.commitPlaceholder}
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
                  className={cx(templateCss.halfWidth, {
                    [templateCss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.path) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('manifestType.path')}
                    placeholder={getString('manifestType.pathPlaceholder')}
                    name="path"
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formik.values?.path) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.path as string}
                      type="String"
                      variableName="path"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('path', value)}
                    />
                  )}
                </div>
              </Layout.Horizontal>
              <Accordion
                activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''}
                className={cx({
                  [templateCss.advancedStepOpen]: isActiveAdvancedStep
                })}
              >
                <Accordion.Panel
                  id={getString('advancedTitle')}
                  addDomId={true}
                  summary={getString('advancedTitle')}
                  details={
                    <Layout.Horizontal width={'90%'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                      <FormMultiTypeCheckboxField
                        name="skipResourceVersioning"
                        label={getString('skipResourceVersion')}
                        multiTypeTextbox={{ expressions }}
                        className={cx(css.checkbox, css.halfWidth)}
                      />
                      <Tooltip
                        position="top"
                        content={
                          <div className={css.tooltipContent}>{getString('manifestType.helmSkipResourceVersion')} </div>
                        }
                        className={css.tooltip}
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

export default OpenShiftTemplateWithGit
