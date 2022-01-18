/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
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
  ButtonVariation,
  FontVariation
} from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { defaultTo, get, merge } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import { ArtifactConfig, ConnectorConfigDTO, DockerBuildDetailsDTO, useGetBuildDetailsForDocker } from 'services/cd-ng'
import { getConnectorIdValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { ArtifactType, ImagePathProps, ImagePathTypes, TagTypes } from '../../../ArtifactInterface'
import { ArtifactIdentifierValidation } from '../../../ArtifactHelper'
import ArtifactImagePathTagView from '../ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

export const DockerRegistryArtifact: React.FC<StepProps<ConnectorConfigDTO> & ImagePathProps> = ({
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
  const [lastImagePath, setLastImagePath] = useState('')
  const [tagList, setTagList] = useState<DockerBuildDetailsDTO[] | undefined>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const schemaObject = {
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.imagePath')),
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

  const defaultStepValues = (): ImagePathTypes => {
    return {
      identifier: '',
      imagePath: '',
      tag: RUNTIME_INPUT_VALUE,
      tagType: TagTypes.Value,
      tagRegex: RUNTIME_INPUT_VALUE
    }
  }
  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  const {
    data,
    loading: dockerBuildDetailsLoading,
    refetch: refetchDockerTag,
    error: dockerTagError
  } = useGetBuildDetailsForDocker({
    queryParams: {
      imagePath: lastImagePath,
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (getMultiTypeFromValue(lastImagePath) === MultiTypeInputType.FIXED) {
      refetchDockerTag()
    }
  }, [lastImagePath, refetchDockerTag])
  useEffect(() => {
    if (dockerTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList)
    }
  }, [data?.data?.buildDetailsList, dockerTagError])

  const canFetchTags = useCallback(
    (imagePath: string): boolean => {
      return !!(
        imagePath.length &&
        getConnectorIdValue(prevStepData).length &&
        getMultiTypeFromValue(getConnectorIdValue(prevStepData)) === MultiTypeInputType.FIXED &&
        lastImagePath !== imagePath &&
        getMultiTypeFromValue(imagePath) === MultiTypeInputType.FIXED
      )
    },
    [lastImagePath, prevStepData]
  )
  const fetchTags = useCallback(
    (imagePath = ''): void => {
      if (canFetchTags(imagePath)) {
        setLastImagePath(imagePath)
      }
    },
    [canFetchTags]
  )

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
      merge(values, { identifier: initialValues?.identifier })
    }

    return values
  }
  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const tagData =
      formData?.tagType === TagTypes.Value
        ? { tag: defaultTo(formData.tag?.value, formData.tag) }
        : { tagRegex: defaultTo(formData.tagRegex?.value, formData.tagRegex) }

    const artifactObj: ArtifactConfig = {
      spec: {
        connectorRef: formData?.connectorId,
        imagePath: formData?.imagePath,
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
        formName="imagePath"
        validationSchema={context === 2 ? sidecarSchema : primarySchema}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            tag: defaultTo(formData?.tag?.value, formData?.tag),
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
              <ArtifactImagePathTagView
                selectedArtifact={selectedArtifact as ArtifactType}
                formik={formik}
                expressions={expressions}
                allowableTypes={allowableTypes}
                isReadonly={isReadonly}
                connectorIdValue={getConnectorIdValue(prevStepData)}
                fetchTags={fetchTags}
                buildDetailsLoading={dockerBuildDetailsLoading}
                tagError={dockerTagError}
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
