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
  Text
} from '@wings-software/uicore'
import { Form } from 'formik'
import { useParams } from 'react-router-dom'
import memoize from 'lodash-es/memoize'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { useListAwsRegions } from 'services/portal'
import { ArtifactConfig, ConnectorConfigDTO, useGetBuildDetailsForEcr } from 'services/cd-ng'
import { useStrings } from 'framework/exports'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { StringUtils } from '@common/exports'
import { ImagePathProps, ImagePathTypes, TagTypes } from '../../../ArtifactInterface'
import { tagOptions } from '../../../ArtifactHelper'
import css from '../../ArtifactConnector.module.scss'

export const ECRArtifact: React.FC<StepProps<ConnectorConfigDTO> & ImagePathProps> = ({
  name,
  context,
  handleSubmit,
  expressions,
  prevStepData,
  initialValues
}) => {
  const { getString } = useStrings()

  const ecrSchema = Yup.object().shape({
    imagePath: Yup.string().trim().required(getString('artifactsSelection.validation.imagePath')),
    region: Yup.mixed().required(getString('artifactsSelection.validation.region')),
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

  const sideCarSchema = Yup.object().shape({
    identifier: Yup.string()
      .trim()
      .required(getString('artifactsSelection.validation.sidecarId'))
      .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
      .notOneOf(StringUtils.illegalIdentifiers),
    imagePath: Yup.string().trim().required(getString('artifactsSelection.validation.imagePath')),
    region: Yup.mixed().required(getString('artifactsSelection.validation.region')),
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
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const [tagList, setTagList] = React.useState([])
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const [lastQueryData, setLastQueryData] = React.useState<{ imagePath: string; region: any }>({
    imagePath: '',
    region: ''
  })

  const { data: ecrBuildData, loading, refetch } = useGetBuildDetailsForEcr({
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: prevStepData?.connectorId?.value
        ? prevStepData?.connectorId?.value
        : prevStepData?.identifier || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      region: lastQueryData.region?.value ? lastQueryData.region.value : lastQueryData.region
    },
    lazy: true
  })

  React.useEffect(() => {
    if (Array.isArray(ecrBuildData?.data?.buildDetailsList)) {
      setTagList(ecrBuildData?.data?.buildDetailsList as [])
    }
  }, [ecrBuildData])

  React.useEffect(() => {
    lastQueryData.region && lastQueryData.imagePath && refetch()
  }, [lastQueryData])

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

      if (getMultiTypeFromValue(specValues?.region) === MultiTypeInputType.FIXED) {
        values.region = regions.find(regionData => regionData.value === specValues?.region)
      }

      if (context === 2 && initialValues?.identifier) {
        values.identifier = initialValues?.identifier
      }
      return values
    }

    return {
      identifier: '',
      imagePath: '',
      tag: RUNTIME_INPUT_VALUE as string,
      tagType: TagTypes.Value,
      tagRegex: ''
    }
  }

  const fetchTags = (imagePath = '', region = '') => {
    if (imagePath && region && (lastQueryData.imagePath !== imagePath || lastQueryData.region !== region)) {
      setLastQueryData({ imagePath, region })
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

  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep} data-id={name}>
      <div className={css.heading}>{getString('artifactsSelection.artifactDetails')}</div>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={context === 2 ? sideCarSchema : ecrSchema}
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
                    label={getString('artifactsSelection.existingDocker.sidecarId')}
                    placeholder={getString('artifactsSelection.existingDocker.sidecarIdPlaceholder')}
                    name="identifier"
                  />
                </div>
              )}
              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  name="region"
                  selectItems={regions}
                  multiTypeInputProps={{
                    selectProps: {
                      defaultSelectedItem: formik.values.region,
                      items: regions
                    }
                  }}
                  label={getString('pipelineSteps.regionLabel')}
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
                    />
                  </div>
                )}
              </div>

              <div className={css.imagePathContainer}>
                <FormInput.MultiTextInput
                  label={getString('artifactsSelection.existingDocker.imageName')}
                  name="imagePath"
                  placeholder={getString('artifactsSelection.existingDocker.imageNamePlaceholder')}
                  multiTextInputProps={{ expressions }}
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
                        items: tags,
                        itemRenderer: itemRenderer,
                        allowCreatingNewItems: true
                      },
                      onFocus: () => fetchTags(formik.values.imagePath, formik.values?.region)
                    }}
                    label={getString('tagLabel')}
                    name="tag"
                  />
                  {getMultiTypeFromValue(formik.values.tag) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values.tag as string}
                        type="String"
                        variableName="dockerConnector"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('tag', value)
                        }}
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
                        variableName="dockerConnector"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('tagRegex', value)
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <Button intent="primary" type="submit" text={getString('save')} className={css.saveBtn} />
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
