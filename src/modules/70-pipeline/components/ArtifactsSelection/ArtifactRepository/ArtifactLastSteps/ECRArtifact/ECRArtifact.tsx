import React, { useCallback, useEffect } from 'react'
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
  ButtonVariation,
  FontVariation
} from '@wings-software/uicore'
import { Form } from 'formik'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo, get, merge } from 'lodash-es'
import { useListAwsRegions } from 'services/portal'
import { ArtifactConfig, ConnectorConfigDTO, useGetBuildDetailsForEcr } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { useQueryParams } from '@common/hooks'
import { getConnectorIdValue, resetTag } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { ArtifactType, ImagePathProps, ImagePathTypes, TagTypes } from '../../../ArtifactInterface'
import { ArtifactIdentifierValidation } from '../../../ArtifactHelper'
import ArtifactImagePathTagView from '../ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

export const ECRArtifact: React.FC<StepProps<ConnectorConfigDTO> & ImagePathProps> = ({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact
}) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [tagList, setTagList] = React.useState([])
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const [lastQueryData, setLastQueryData] = React.useState<{ imagePath: string; region: any }>({
    imagePath: '',
    region: ''
  })

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

  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  const {
    data: ecrBuildData,
    loading: ecrBuildDetailsLoading,
    refetch: refetchECRBuilddata,
    error: ecrTagError
  } = useGetBuildDetailsForEcr({
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      region: defaultTo(lastQueryData.region.value, lastQueryData.region),
      repoIdentifier,
      branch
    },
    lazy: true
  })
  useEffect(() => {
    if (ecrTagError) {
      setTagList([])
    } else if (Array.isArray(ecrBuildData?.data?.buildDetailsList)) {
      setTagList(ecrBuildData?.data?.buildDetailsList as [])
    }
  }, [ecrBuildData, ecrTagError])
  useEffect(() => {
    if (
      lastQueryData.region &&
      lastQueryData.imagePath &&
      getConnectorIdValue(prevStepData).length &&
      getMultiTypeFromValue(getConnectorIdValue(prevStepData)) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(lastQueryData.imagePath) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(lastQueryData.region) === MultiTypeInputType.FIXED
    ) {
      refetchECRBuilddata()
    }
  }, [lastQueryData, prevStepData, refetchECRBuilddata])

  const { data } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  useEffect(() => {
    const regionValues = defaultTo(data?.resource, []).map(region => ({
      value: region.value,
      label: region.name
    }))
    setRegions(regionValues as SelectOption[])
  }, [data?.resource])

  const fetchTags = (imagePath = '', region = ''): void => {
    if (canFetchTags(imagePath, region)) {
      setLastQueryData({ imagePath, region })
    }
  }
  const canFetchTags = useCallback(
    (imagePath: string, region: string): boolean =>
      !!(
        imagePath &&
        getMultiTypeFromValue(imagePath) === MultiTypeInputType.FIXED &&
        region &&
        (lastQueryData.imagePath !== imagePath || lastQueryData.region !== region)
      ),
    [lastQueryData.imagePath, lastQueryData.region]
  )

  const defaultStepValues = (): ImagePathTypes => {
    return {
      identifier: '',
      imagePath: '',
      tag: RUNTIME_INPUT_VALUE,
      tagType: TagTypes.Value,
      tagRegex: RUNTIME_INPUT_VALUE
    }
  }
  const getInitialValues = useCallback((): ImagePathTypes => {
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
      merge(values, { identifier: initialValues?.identifier })
    }
    return values
  }, [context, initialValues, regions, selectedArtifact])

  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const tagData =
      formData?.tagType === TagTypes.Value
        ? { tag: defaultTo(formData.tag?.value, formData.tag) }
        : { tagRegex: defaultTo(formData.tagRegex?.value, formData.tagRegex) }

    const artifactObj: ArtifactConfig = {
      spec: {
        connectorRef: formData?.connectorId,
        imagePath: formData?.imagePath,
        region: formData?.region?.value ? formData?.region?.value : formData?.region,
        ...tagData
      }
    }
    if (context === 2) {
      merge(artifactObj, { identifier: formData?.identifier })
    }
    handleSubmit(artifactObj)
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={context === 2 ? sideCarSchema : ecrSchema}
        formName="ecrArtifact"
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorId: getConnectorIdValue(prevStepData)
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
              <ArtifactImagePathTagView
                selectedArtifact={selectedArtifact as ArtifactType}
                formik={formik}
                expressions={expressions}
                allowableTypes={allowableTypes}
                isReadonly={isReadonly}
                connectorIdValue={getConnectorIdValue(prevStepData)}
                fetchTags={imagePath => fetchTags(imagePath, formik.values?.region)}
                buildDetailsLoading={ecrBuildDetailsLoading}
                tagError={ecrTagError}
                tagList={tagList}
                setTagList={setTagList}
              />
            </div>

            <Layout.Horizontal spacing="medium">
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
