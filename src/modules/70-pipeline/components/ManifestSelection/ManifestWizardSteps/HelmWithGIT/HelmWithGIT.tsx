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
  Accordion
} from '@wings-software/uicore'
import cx from 'classnames'
import { Form } from 'formik'
import * as Yup from 'yup'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { get } from 'lodash-es'
import { StringUtils } from '@common/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/exports'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import i18n from '../ManifestWizard.i18n'
import HelmAdvancedStepSection from '../HelmAdvancedStepSection'
import type { CommandFlags, HelmWithGITDataType } from '../../ManifestInterface'
import { GitRepoName, helmVersions, ManifestStoreMap } from '../../Manifesthelper'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from './HelmWithGIT.module.scss'

const gitFetchTypes = [
  { label: i18n.gitFetchTypes[0].label, value: 'Branch' },
  { label: i18n.gitFetchTypes[1].label, value: 'Commit' }
]

const commandFlagOptions = [
  { label: 'Version ', value: 'Version' },
  { label: 'Template ', value: 'Template' }
]
interface HelmWithGITPropType {
  stepName: string
  expressions: string[]
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
}

const HelmWithGIT: React.FC<StepProps<ConnectorConfigDTO> & HelmWithGITPropType> = ({
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

  const getInitialValues = React.useCallback((): HelmWithGITDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      const values = {
        ...specValues,
        identifier: initialValues.identifier,
        folderPath: specValues.folderPath,
        repoName: getRepoName(),
        helmVersion: initialValues.spec?.helmVersion,
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning,
        commandFlags: initialValues.spec?.commandFlags?.map((commandFlag: { commandType: string; flag: string }) => ({
          commandType: commandFlag.commandType,
          flag: commandFlag.flag
          // id: uuid(commandFlag, nameSpace())
        })) || [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
      }
      return values
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: '',
      helmVersion: 'V2',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }],
      repoName: getRepoName()
    }
  }, [])

  const submitFormData = (formData: HelmWithGITDataType & { store?: string; connectorRef?: string }): void => {
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
              folderPath: formData?.folderPath
            }
          },
          skipResourceVersioning: formData?.skipResourceVersioning,
          helmVersion: formData?.helmVersion
        }
      }
    }
    if (formData?.commandFlags[0].commandType) {
      ;(manifestObj?.manifest?.spec as any).commandFlags = formData?.commandFlags.map((commandFlag: CommandFlags) => ({
        commandType: commandFlag.commandType,
        flag: commandFlag.flag
      }))
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
          folderPath: Yup.string().trim().required(getString('manifestType.folderPathRequired')),
          helmVersion: Yup.string().trim().required(getString('manifestType.helmVersionRequired'))
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
        {(formik: { setFieldValue: (a: string, b: string) => void; values: HelmWithGITDataType }) => (
          <Form>
            <div className={helmcss.helmGitForm}>
              <FormInput.Text
                name="identifier"
                label={getString('manifestType.manifestIdentifier')}
                placeholder={getString('manifestType.manifestPlaceholder')}
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
                  <FormInput.Select name="gitFetchType" label={i18n.STEP_TWO.gitFetchTypeLabel} items={gitFetchTypes} />
                </div>

                {formik.values?.gitFetchType === gitFetchTypes[0].value && (
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
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
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
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
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('chartPath')}
                    placeholder={getString('manifestType.pathPlaceholder')}
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
                </div>
                <div className={helmcss.halfWidth}>
                  <FormInput.Select name="helmVersion" label={getString('helmVersion')} items={helmVersions} />
                </div>
              </Layout.Horizontal>
              <Accordion
                activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''}
                className={cx({
                  [helmcss.advancedStepOpen]: isActiveAdvancedStep
                })}
              >
                <Accordion.Panel
                  id={getString('advancedTitle')}
                  addDomId={true}
                  summary={getString('advancedTitle')}
                  details={
                    <HelmAdvancedStepSection
                      expressions={expressions}
                      formik={formik}
                      commandFlagOptions={commandFlagOptions}
                    />
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

export default HelmWithGIT
