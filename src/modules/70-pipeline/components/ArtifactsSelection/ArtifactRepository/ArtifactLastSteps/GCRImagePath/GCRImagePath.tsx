/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
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
  ButtonVariation,
  FontVariation
} from '@wings-software/uicore'
import { Menu } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { Form } from 'formik'
import * as Yup from 'yup'
import { get, memoize } from 'lodash-es'
import { ArtifactConfig, ConnectorConfigDTO, useGetBuildDetailsForGcr } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { getConnectorIdValue, RegistryHostNames, resetTag } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { ArtifactType, ImagePathProps, ImagePathTypes, TagTypes } from '../../../ArtifactInterface'
import { ArtifactIdentifierValidation } from '../../../ArtifactHelper'
import ArtifactImagePathTagView from '../ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

export const gcrUrlList: SelectOption[] = Object.values(RegistryHostNames).map(item => ({ label: item, value: item }))
export const GCRImagePath: React.FC<StepProps<ConnectorConfigDTO> & ImagePathProps> = ({
  context,
  expressions,
  allowableTypes,
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
  const [tagList, setTagList] = useState([])
  const [lastQueryData, setLastQueryData] = useState({ imagePath: '', registryHostname: '' })
  const {
    data,
    loading: gcrBuildDetailsLoading,
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

  useEffect(() => {
    if (gcrTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList as [])
    }
  }, [data, gcrTagError])

  useEffect(() => {
    if (
      lastQueryData.registryHostname.length &&
      lastQueryData.imagePath.length &&
      getConnectorIdValue(prevStepData).length &&
      getMultiTypeFromValue(getConnectorIdValue(prevStepData)) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(lastQueryData.registryHostname) === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(lastQueryData.imagePath) === MultiTypeInputType.FIXED
    ) {
      refetch()
    }
  }, [lastQueryData, refetch])

  const defaultStepValues = (): ImagePathTypes => {
    return {
      identifier: '',
      imagePath: '',
      tag: RUNTIME_INPUT_VALUE,
      tagType: TagTypes.Value,
      tagRegex: RUNTIME_INPUT_VALUE,
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

  const registryHostNameRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={gcrBuildDetailsLoading}
        onClick={handleClick}
      />
    </div>
  ))
  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={context === 2 ? sidecarSchema : primarySchema}
        formName="gcrImagePath"
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            tag: formData?.tag?.value ? formData?.tag?.value : formData?.tag,
            connectorId: getConnectorIdValue(prevStepData)
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
                    allowableTypes,
                    selectProps: {
                      allowCreatingNewItems: true,
                      addClearBtn: true,
                      items: gcrUrlList,
                      itemRenderer: registryHostNameRenderer
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
              <ArtifactImagePathTagView
                selectedArtifact={selectedArtifact as ArtifactType}
                formik={formik}
                expressions={expressions}
                allowableTypes={allowableTypes}
                isReadonly={isReadonly}
                connectorIdValue={getConnectorIdValue(prevStepData)}
                fetchTags={imagePath => fetchTags(imagePath, formik.values?.registryHostname)}
                buildDetailsLoading={gcrBuildDetailsLoading}
                tagError={gcrTagError}
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
