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
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'
import { Form } from 'formik'
import memoize from 'lodash-es/memoize'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { ArtifactConfig, ConnectorConfigDTO, useGetBuildDetailsForDocker } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { ImagePathProps, ImagePathTypes, TagTypes } from '../../../ArtifactInterface'
import { ArtifactIdentifierValidation, tagOptions } from '../../../ArtifactHelper'
import css from '../../ArtifactConnector.module.scss'

export const ImagePath: React.FC<StepProps<ConnectorConfigDTO> & ImagePathProps> = ({
  name,
  context,
  handleSubmit,
  expressions,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false
}) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [tagList, setTagList] = React.useState([])
  const [lastImagePath, setLastImagePath] = React.useState('')

  const primarySchema = Yup.object().shape({
    imagePath: Yup.string().trim().required(getString('artifactsSelection.validation.imagePath')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('artifactsSelection.validation.tag'))
    })
  })

  const sidecarSchema = Yup.object().shape({
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    ),
    imagePath: Yup.string().trim().required(getString('artifactsSelection.validation.imagePath')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('artifactsSelection.validation.tag'))
    })
  })

  const { data, loading, refetch, error: dockerTagError } = useGetBuildDetailsForDocker({
    queryParams: {
      imagePath: lastImagePath,
      connectorRef: prevStepData?.connectorId?.value
        ? prevStepData?.connectorId?.value
        : prevStepData?.identifier || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    if (dockerTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList as [])
    }
  }, [data, dockerTagError])

  React.useEffect(() => {
    if (lastImagePath && getMultiTypeFromValue(lastImagePath) === MultiTypeInputType.FIXED) {
      refetch()
    }
  }, [lastImagePath, refetch])
  const getSelectItems = React.useCallback(() => {
    const list = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
    return list
  }, [tagList])

  const tags = loading ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }] : getSelectItems()

  const getInitialValues = (): ImagePathTypes => {
    const specValues = get(initialValues, 'spec', null)
    if (specValues) {
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

    return {
      identifier: '',
      imagePath: '',
      tag: RUNTIME_INPUT_VALUE,
      tagType: TagTypes.Value,
      tagRegex: ''
    }
  }

  const fetchTags = (imagePath = ''): void => {
    if (
      imagePath.length &&
      lastImagePath !== imagePath &&
      getMultiTypeFromValue(imagePath) === MultiTypeInputType.FIXED
    ) {
      setLastImagePath(imagePath)
    }
  }

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
  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep} data-id={name}>
      <div className={css.heading}>{getString('artifactsSelection.artifactDetails')}</div>
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={context === 2 ? sidecarSchema : primarySchema}
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
                    label={getString('artifactsSelection.existingDocker.sidecarId')}
                    placeholder={getString('artifactsSelection.existingDocker.sidecarIdPlaceholder')}
                    name="identifier"
                  />
                </div>
              )}
              <div className={css.imagePathContainer}>
                <FormInput.MultiTextInput
                  label={getString('artifactsSelection.existingDocker.imageName')}
                  name="imagePath"
                  placeholder={getString('artifactsSelection.existingDocker.imageNamePlaceholder')}
                  multiTextInputProps={{ expressions }}
                  onChange={val => {
                    setLastImagePath(val as string)
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
                    multiTypeInputProps={{
                      expressions,
                      selectProps: {
                        defaultSelectedItem: formik.values?.tag,
                        noResults: (
                          <span className={css.padSmall}>
                            <Text lineClamp={1}>
                              {get(dockerTagError, 'data.message', null) ||
                                getString('pipelineSteps.deploy.errors.notags')}{' '}
                            </Text>
                          </span>
                        ),
                        items: tags,
                        addClearBtn: true,
                        itemRenderer: itemRenderer,
                        allowCreatingNewItems: true
                      },
                      onFocus: () => fetchTags(formik.values.imagePath)
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
                    placeholder={getString('artifactsSelection.existingDocker.enterTagRegex')}
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
              <Button text={getString('back')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
              <Button intent="primary" type="submit" text={getString('submit')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
