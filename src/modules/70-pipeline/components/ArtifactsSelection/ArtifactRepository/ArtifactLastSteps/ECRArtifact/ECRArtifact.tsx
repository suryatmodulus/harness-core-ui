import React from 'react'
import { Menu } from '@blueprintjs/core'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  SelectOption,
  StepProps,
  RUNTIME_INPUT_VALUE,
  Text,
  ButtonVariation
} from '@wings-software/uicore'
import { Form } from 'formik'
import { useParams } from 'react-router-dom'
import memoize from 'lodash-es/memoize'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { useListAwsRegions } from 'services/portal'
import { ArtifactConfig, ConnectorConfigDTO, useGetBuildDetailsForEcr } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { useQueryParams } from '@common/hooks'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { getHelpeTextForTags } from '@pipeline/utils/stageHelpers'
import { ImagePathProps, ImagePathTypes, TagTypes } from '../../../ArtifactInterface'
import { ArtifactIdentifierValidation, tagOptions } from '../../../ArtifactHelper'
import css from '../../ArtifactConnector.module.scss'

export const ECRArtifact: React.FC<StepProps<ConnectorConfigDTO> & ImagePathProps> = ({
  context,
  handleSubmit,
  expressions,
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
    region: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.region')),
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

  const ecrSchema = Yup.object().shape(schemaObject)

  const sideCarSchema = Yup.object().shape({
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
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const [lastQueryData, setLastQueryData] = React.useState<{ imagePath: string; region: any }>({
    imagePath: '',
    region: ''
  })

  const {
    data: ecrBuildData,
    loading,
    refetch,
    error: ecrTagError
  } = useGetBuildDetailsForEcr({
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: prevStepData?.connectorId?.value
        ? prevStepData?.connectorId?.value
        : prevStepData?.identifier || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      region: lastQueryData.region?.value ? lastQueryData.region.value : lastQueryData.region,
      repoIdentifier,
      branch
    },
    lazy: true
  })

  React.useEffect(() => {
    if (ecrTagError) {
      setTagList([])
    } else if (Array.isArray(ecrBuildData?.data?.buildDetailsList)) {
      setTagList(ecrBuildData?.data?.buildDetailsList as [])
    }
  }, [ecrBuildData, ecrTagError])

  React.useEffect(() => {
    if (
      lastQueryData.region &&
      lastQueryData.imagePath &&
      getConnectorIdValue().length &&
      getMultiTypeFromValue(getConnectorIdValue()) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(lastQueryData.imagePath) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(lastQueryData.region) === MultiTypeInputType.FIXED
    ) {
      refetch()
    }
  }, [lastQueryData, refetch])

  const { data } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  React.useEffect(() => {
    const regionValues = (data?.resource || []).map(region => ({
      value: region.value,
      label: region.name
    }))
    setRegions(regionValues as SelectOption[])
  }, [data?.resource])

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
      tagRegex: ''
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

    if (getMultiTypeFromValue(specValues?.region) === MultiTypeInputType.FIXED) {
      values.region = regions.find(regionData => regionData.value === specValues?.region)
    }

    if (context === 2 && initialValues?.identifier) {
      values.identifier = initialValues?.identifier
    }
    return values
  }

  const fetchTags = (imagePath = '', region = ''): void => {
    if (canFetchTags(imagePath, region)) {
      setLastQueryData({ imagePath, region })
    }
  }

  const canFetchTags = (imagePath: string, region: string): boolean =>
    !!(
      imagePath &&
      getMultiTypeFromValue(imagePath) === MultiTypeInputType.FIXED &&
      region &&
      (lastQueryData.imagePath !== imagePath || lastQueryData.region !== region)
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
        region: formData?.region?.value ? formData?.region?.value : formData?.region,
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
        validationSchema={context === 2 ? sideCarSchema : ecrSchema}
        formName="ecrArtifact"
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorId: getConnectorIdValue()
          })
        }}
        enableReinitialize={true}
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
                  name="region"
                  selectItems={regions}
                  multiTypeInputProps={{
                    onChange: () => {
                      tagList.length && setTagList([])
                      resetTag(formik)
                    },
                    selectProps: {
                      defaultSelectedItem: formik.values.region,
                      items: regions
                    }
                  }}
                  label={getString('regionLabel')}
                  placeholder={getString('select')}
                />

                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.region as string}
                      type="String"
                      variableName="region"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('region', value)
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
                          region: formik.values?.region || '',
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
                          <span className={css.padSmall}>
                            <Text lineClamp={1}>
                              {get(ecrTagError, 'data.message', null) ||
                                getString('pipelineSteps.deploy.errors.notags')}
                            </Text>
                          </span>
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
                        fetchTags(formik.values.imagePath, formik.values?.region)
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
