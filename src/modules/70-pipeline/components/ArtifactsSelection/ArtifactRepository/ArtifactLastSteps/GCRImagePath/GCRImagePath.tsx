import React from 'react'
import { Menu } from '@blueprintjs/core'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  ButtonVariation
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Form } from 'formik'
import memoize from 'lodash-es/memoize'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { ArtifactConfig, ConnectorConfigDTO, useGetBuildDetailsForGcr } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { getHelpeTextForTags } from '@pipeline/utils/stageHelpers'
import { ImagePathProps, ImagePathTypes, TagTypes } from '../../../ArtifactInterface'
import { ArtifactIdentifierValidation, tagOptions } from '../../../ArtifactHelper'
import css from '../../GCRArtifact.module.scss'

export enum RegistryHostNames {
  GCR_URL = 'gcr.io',
  US_GCR_URL = 'us.gcr.io',
  ASIA_GCR_URL = 'asia.gcr.io',
  EU_GCR_URL = 'eu.gcr.io',
  MIRROR_GCR_URL = 'mirror.gcr.io',
  K8S_GCR_URL = 'k8s.gcr.io',
  LAUNCHER_GCR_URL = 'launcher.gcr.io'
}

export const gcrUrlList: SelectOption[] = Object.values(RegistryHostNames).map(item => ({ label: item, value: item }))

export const GCRImagePath: React.FC<StepProps<ConnectorConfigDTO> & ImagePathProps> = ({
  context,
  expressions,
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact
}) => {
  const { getString } = useStrings()

  const schemaObject = {
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.imagePath')),
    registryHostname: Yup.string().trim().required('GCR Registry URL is required'),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)

  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [tagList, setTagList] = React.useState([])
  const [lastQueryData, setLastQueryData] = React.useState({ imagePath: '', registryHostname: '' })
  const {
    data,
    loading,
    refetch,
    error: gcrTagError
  } = useGetBuildDetailsForGcr({
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: prevStepData?.connectorId?.value
        ? prevStepData?.connectorId?.value
        : prevStepData?.identifier || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      registryHostname: lastQueryData.registryHostname,
      repoIdentifier,
      branch
    },
    lazy: true
  })

  React.useEffect(() => {
    if (gcrTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList as [])
    }
  }, [data, gcrTagError])

  React.useEffect(() => {
    if (
      lastQueryData.registryHostname.length &&
      lastQueryData.imagePath.length &&
      getConnectorIdValue().length &&
      getMultiTypeFromValue(getConnectorIdValue()) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(lastQueryData.registryHostname) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(lastQueryData.imagePath) === MultiTypeInputType.FIXED
    ) {
      refetch()
    }
  }, [lastQueryData, refetch])

  const getSelectItems = React.useCallback(() => {
    const list = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
    return list
  }, [tagList])
  const tags = loading ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }] : getSelectItems()

  const defaultStepValues = (): ImagePathTypes => {
    return {
      identifier: '',
      imagePath: '',
      tag: RUNTIME_INPUT_VALUE as string,
      tagType: TagTypes.Value,
      tagRegex: '',
      registryHostname: ''
    }
  }

  const getInitialValues = (): ImagePathTypes => {
    const specValues = get(initialValues, 'spec', null)
    if (selectedArtifact !== (initialValues as any)?.type || !specValues) {
      return defaultStepValues()
    }

    const values = {
      ...specValues,
      tagType: specValues.tag ? TagTypes.Value : TagTypes.Regex
    }
    if (getMultiTypeFromValue(specValues?.tag) === MultiTypeInputType.FIXED) {
      values.tag = { label: specValues?.tag, value: specValues?.tag }
    }
    if (context === 2 && initialValues?.identifier) {
      values.identifier = initialValues?.identifier
    }
    return values
  }
  const fetchTags = (imagePath = '', registryHostname = ''): void => {
    if (canFetchTags(imagePath, registryHostname)) {
      setLastQueryData({ imagePath, registryHostname })
    }
  }

  const canFetchTags = (imagePath: string, registryHostname: string): boolean =>
    !!(
      imagePath.length &&
      getMultiTypeFromValue(imagePath) === MultiTypeInputType.FIXED &&
      registryHostname.length &&
      (lastQueryData.imagePath !== imagePath || lastQueryData.registryHostname !== registryHostname)
    )

  const getConnectorIdValue = (): string => {
    if (getMultiTypeFromValue(prevStepData?.connectorId) !== MultiTypeInputType.FIXED) {
      return prevStepData?.connectorId
    }
    if (prevStepData?.connectorId?.value) {
      return prevStepData?.connectorId?.value
    }
    return prevStepData?.identifier || ''
  }

  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const tagData =
      formData?.tagType === TagTypes.Value
        ? { tag: formData.tag?.value || formData.tag }
        : { tagRegex: formData.tagRegex?.value || formData.tagRegex }

    const artifactObj: ArtifactConfig = {
      spec: {
        connectorRef: formData?.connectorId,
        imagePath: formData?.imagePath,
        registryHostname: formData?.registryHostname,
        ...tagData
      }
    }
    if (context === 2) {
      artifactObj.identifier = formData?.identifier
    }
    handleSubmit(artifactObj)
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={loading}
        onClick={handleClick}
      />
    </div>
  ))
  const resetTag = (formik: any): void => {
    formik.values.tagType === 'value' &&
      getMultiTypeFromValue(formik.values.tag?.value) === MultiTypeInputType.FIXED &&
      formik.values.tag?.value?.length &&
      formik.setFieldValue('tag', '')
  }
  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep}>
      <div className={css.heading}>{getString('pipeline.artifactsSelection.artifactDetails')}</div>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={context === 2 ? sidecarSchema : primarySchema}
        formName="gcrImagePath"
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            tag: formData?.tag?.value ? formData?.tag?.value : formData?.tag,
            connectorId: getConnectorIdValue()
          })
        }}
      >
        {formik => (
          <Form>
            <div className={css.connectorForm}>
              {context === 2 && (
                <div className={css.dockerSideCard}>
                  <FormInput.Text
                    label={getString('pipeline.artifactsSelection.existingDocker.sidecarId')}
                    placeholder={getString('pipeline.artifactsSelection.existingDocker.sidecarIdPlaceholder')}
                    name="identifier"
                  />
                </div>
              )}
              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  label={getString('connectors.GCR.registryHostname')}
                  placeholder={getString('common.validation.urlIsRequired')}
                  name="registryHostname"
                  selectItems={gcrUrlList}
                  useValue
                  multiTypeInputProps={{
                    onChange: () => {
                      tagList.length && setTagList([])
                      resetTag(formik)
                    },
                    expressions,
                    selectProps: {
                      allowCreatingNewItems: true,
                      addClearBtn: true,
                      items: gcrUrlList,
                      itemRenderer: itemRenderer
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values.registryHostname) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      value={formik.values.imagePath as string}
                      type="String"
                      variableName="registryHostname"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('registryHostname', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>
              <div className={css.imagePathContainer}>
                <FormInput.MultiTextInput
                  label={getString('pipeline.imagePathLabel')}
                  name="imagePath"
                  placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
                  multiTextInputProps={{ expressions }}
                  onChange={() => {
                    tagList.length && setTagList([])
                    resetTag(formik)
                  }}
                />
                {getMultiTypeFromValue(formik.values.imagePath) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      value={formik.values.imagePath as string}
                      type="String"
                      variableName="imagePath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('imagePath', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>

              <div className={css.tagGroup}>
                <FormInput.RadioGroup
                  name="tagType"
                  radioGroup={{ inline: true }}
                  items={tagOptions}
                  className={css.radioGroup}
                />
              </div>
              {formik.values.tagType === 'value' ? (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    selectItems={tags}
                    disabled={!formik.values?.imagePath?.length}
                    helperText={
                      getMultiTypeFromValue(formik.values?.tag) === MultiTypeInputType.FIXED &&
                      getHelpeTextForTags(
                        {
                          imagePath: formik.values?.imagePath,
                          registryHostname: formik.values?.registryHostname || '',
                          connectorRef: getConnectorIdValue()
                        },
                        getString
                      )
                    }
                    multiTypeInputProps={{
                      expressions,
                      selectProps: {
                        defaultSelectedItem: formik.values?.tag,
                        noResults: (
                          <Text lineClamp={1}>
                            {get(gcrTagError, 'data.message', null) || getString('pipelineSteps.deploy.errors.notags')}
                          </Text>
                        ),
                        items: tags,
                        itemRenderer: itemRenderer,
                        allowCreatingNewItems: true
                      },
                      onFocus: (e: any) => {
                        if (
                          e?.target?.type !== 'text' ||
                          (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                        ) {
                          return
                        }
                        fetchTags(formik.values.imagePath, formik.values?.registryHostname)
                      }
                    }}
                    label={getString('tagLabel')}
                    name="tag"
                  />
                  {getMultiTypeFromValue(formik.values.tag) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values.tag as string}
                        type="String"
                        variableName="tag"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('tag', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
              ) : null}

              {formik.values.tagType === 'regex' ? (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('tagRegex')}
                    name="tagRegex"
                    placeholder={getString('pipeline.artifactsSelection.existingDocker.enterTagRegex')}
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formik.values.tagRegex) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values.tagRegex as string}
                        type="String"
                        variableName="tagRegex"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('tagRegex', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
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
