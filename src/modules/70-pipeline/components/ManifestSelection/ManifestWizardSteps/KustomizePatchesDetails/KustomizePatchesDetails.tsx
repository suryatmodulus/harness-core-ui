import React, { useCallback } from 'react'
import {
  Text,
  Layout,
  Button,
  FormInput,
  StepProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Color,
  Formik,
  ButtonVariation,
  Icon
} from '@wings-software/uicore'

import { Form, FieldArray, FieldArrayRenderProps } from 'formik'
import { get, set } from 'lodash-es'

import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import type { KustomizePatchDataType, ManifestTypes } from '../../ManifestInterface'

import { gitFetchTypeList, GitFetchTypes, GitRepoName, ManifestDataType, ManifestStoreMap } from '../../Manifesthelper'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface KustomizePathPropTypes {
  key?: string
  name?: string
  stepName: string
  expressions: string[]
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  selectedManifest: ManifestTypes | null
  isReadonly?: boolean
}

const getInitValues = (initialValues: any) => {
  const specValues = get(initialValues, 'spec.store.spec', null)

  if (specValues) {
    return {
      ...specValues,
      identifier: initialValues.identifier,
      paths:
        typeof specValues.paths === 'string'
          ? specValues.paths
          : specValues.paths.map((path: string) => ({
              id: uuid('', nameSpace()),
              path: path
            }))
    }
  }
  return {
    identifier: '',
    branch: undefined,
    commitId: undefined,
    gitFetchType: 'Branch',
    paths: [{ path: '', id: uuid('', nameSpace()) }]
  }
}

const submitKustomizePatchData = (
  formData: KustomizePatchDataType & { store?: string; connectorRef?: string },
  connectionType: string
) => {
  const manifestObj: ManifestConfigWrapper = {
    manifest: {
      identifier: formData.identifier,
      type: ManifestDataType.KustomizePatches,
      spec: {
        store: {
          type: formData?.store,
          spec: {
            connectorRef: formData?.connectorRef,
            gitFetchType: formData?.gitFetchType,
            paths:
              typeof formData?.paths === 'string' ? formData?.paths : formData?.paths?.map((path: any) => path.path)
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
  return manifestObj
}

const Footer = (previousStep: any, prevStepData: any): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="medium" margin={{ top: 'huge' }}>
      <Button
        variation={ButtonVariation.SECONDARY}
        text={getString('back')}
        icon="chevron-left"
        onClick={() => previousStep?.(prevStepData)}
      />
      <Button variation={ButtonVariation.PRIMARY} type="submit" text={getString('submit')} rightIcon="chevron-right" />
    </Layout.Horizontal>
  )
}

const renderBranch = (formik: any, isReadonly: boolean, label: string, placeholder: string, expressions?: any) => {
  return (
    <div
      className={cx(helmcss.halfWidth, {
        [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME
      })}
    >
      <FormInput.MultiTextInput
        label={label}
        placeholder={placeholder}
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
          isReadonly={isReadonly}
        />
      )}
    </div>
  )
}

const renderCommitId = (formik: any, isReadonly: boolean, label: string, placeholder: string, expressions?: any) => {
  return (
    <div
      className={cx(helmcss.halfWidth, {
        [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME
      })}
    >
      <FormInput.MultiTextInput
        label={label}
        placeholder={placeholder}
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
          isReadonly={isReadonly}
        />
      )}
    </div>
  )
}

const renderPathArr = ({
  index,
  selectedManifest,
  manifestPathPlaceholder,
  pathPlaceholder,
  expressions
}: {
  index: number
  selectedManifest: string | null
  manifestPathPlaceholder: string
  pathPlaceholder: string
  expressions: any
}) => {
  return (
    <>
      <Icon name="drag-handle-vertical" className={css.drag} />
      <Text width={12}>{`${index + 1}.`}</Text>
      <FormInput.MultiTextInput
        label={''}
        placeholder={selectedManifest === ManifestDataType.KustomizePatches ? manifestPathPlaceholder : pathPlaceholder}
        name={`paths[${index}].path`}
        style={{ width: 275 }}
        multiTextInputProps={{
          expressions,
          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
        }}
      />
    </>
  )
}

const KustomizePatchDetails: React.FC<StepProps<ConnectorConfigDTO> & KustomizePathPropTypes> = ({
  stepName,
  expressions,
  initialValues,
  selectedManifest,
  prevStepData,
  previousStep,
  isReadonly = false,
  handleSubmit
}) => {
  const { getString } = useStrings()
  const gitConnectionType: string = prevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])

  const onDragEnd = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      /* istanbul ignore else */
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      /* istanbul ignore else */
      if (data) {
        const index = parseInt(data, 10)
        arrayHelpers.swap(index, droppedIndex)
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
  )

  const submitFormData = (formData: KustomizePatchDataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj = submitKustomizePatchData(formData, connectionType)
    handleSubmit(manifestObj)
  }

  const getInitialValues = React.useCallback((): KustomizePatchDataType => {
    return getInitValues(initialValues)
  }, [])
  const defaultValueToReset = [{ path: '', uuid: uuid('', nameSpace()) }]

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      <Text font="large" color={Color.GREY_800}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="kustomizePath"
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
        {(formik: { setFieldValue: (a: string, b: string) => void; values: KustomizePatchDataType }) => (
          <Form>
            <div className={helmcss.helmGitForm}>
              <Layout.Horizontal flex spacing="huge">
                <div className={helmcss.halfWidth}>
                  <FormInput.Text
                    name="identifier"
                    label={getString('pipeline.manifestType.manifestIdentifier')}
                    placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                  />
                </div>
              </Layout.Horizontal>
              <Layout.Horizontal flex spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                <div className={helmcss.halfWidth}>
                  <FormInput.Select
                    name="gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    items={gitFetchTypeList}
                  />
                </div>
                {formik.values?.gitFetchType === GitFetchTypes.Branch &&
                  renderBranch(
                    formik,
                    isReadonly,
                    getString('pipelineSteps.deploy.inputSet.branch'),
                    getString('pipeline.manifestType.branchPlaceholder'),
                    expressions
                  )}

                {formik.values?.gitFetchType === GitFetchTypes.Commit &&
                  renderCommitId(
                    formik,
                    isReadonly,
                    getString('pipeline.manifestType.commitId'),
                    getString('pipeline.manifestType.commitPlaceholder'),
                    expressions
                  )}
              </Layout.Horizontal>
              <div className={css.halfWidth}>
                <MultiTypeFieldSelector
                  defaultValueToReset={defaultValueToReset}
                  name={'paths'}
                  label={
                    <Text>
                      {selectedManifest === ManifestDataType.KustomizePatches
                        ? getString('fileFolderPathText')
                        : getString('common.git.filePath')}
                    </Text>
                  }
                >
                  <FieldArray
                    name="paths"
                    render={arrayHelpers => (
                      <Layout.Vertical>
                        {formik.values?.paths?.map((path: { path: string; uuid: string }, index: number) => (
                          <Layout.Horizontal
                            key={path.uuid}
                            flex={{ distribution: 'space-between' }}
                            style={{ alignItems: 'end' }}
                          >
                            <Layout.Horizontal
                              spacing="medium"
                              style={{ alignItems: 'baseline' }}
                              draggable={true}
                              onDragStart={event => {
                                onDragStart(event, index)
                              }}
                              onDragEnd={onDragEnd}
                              onDragOver={onDragOver}
                              onDragLeave={onDragLeave}
                              onDrop={event => onDrop(event, arrayHelpers, index)}
                            >
                              {renderPathArr({
                                index,
                                selectedManifest,
                                manifestPathPlaceholder: getString('pipeline.manifestType.manifestPathPlaceholder'),
                                pathPlaceholder: getString('pipeline.manifestType.pathPlaceholder'),
                                expressions
                              })}
                            </Layout.Horizontal>
                            {formik.values?.paths?.length > 1 && (
                              <Button minimal icon="main-trash" onClick={() => arrayHelpers.remove(index)} />
                            )}
                          </Layout.Horizontal>
                        ))}
                        <span>
                          <Button
                            text={getString('addFileText')}
                            variation={ButtonVariation.LINK}
                            className={css.addFileButton}
                            onClick={() => arrayHelpers.push({ path: '', uuid: uuid('', nameSpace()) })}
                          />
                        </span>
                      </Layout.Vertical>
                    )}
                  />
                </MultiTypeFieldSelector>
              </div>
            </div>
            <Footer previousStep={previousStep} prevStepData={prevStepData} />
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default KustomizePatchDetails
