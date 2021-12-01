import React, { forwardRef, useMemo, useRef, useState } from 'react'
import {
  Container,
  Formik,
  FormInput,
  Layout,
  MultiTypeInputType,
  SelectOption,
  PageError,
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { GetEnvironmentListQueryParams, useGetEnvironmentList } from 'services/cd-ng'
import { GetAllFeaturesQueryParams, useGetAllFeatures } from 'services/cf'
import { useStrings } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { FlagConfigurationStepData } from './types'
import FlagChanges from './FlagChanges/FlagChanges'

export interface FlagConfigurationStepWidgetProps {
  initialValues: FlagConfigurationStepData
  isNewStep?: boolean
  readonly?: boolean
  onUpdate: (data: FlagConfigurationStepData) => void
  stepViewType?: StepViewType
}

const FlagConfigurationStepWidget = forwardRef(
  (
    { initialValues, onUpdate, isNewStep, readonly }: FlagConfigurationStepWidgetProps,
    formikRef: StepFormikFowardRef<FlagConfigurationStepData>
  ) => {
    const [isInitialRender, setIsInitialRender] = useState<boolean>(true)
    const formValuesRef = useRef<FlagConfigurationStepData>({} as FlagConfigurationStepData)
    const { getString } = useStrings()

    const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()

    const envQueryParams: GetEnvironmentListQueryParams = {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }

    const {
      data: environmentsData,
      loading: loadingEnvironments,
      error: errorEnvironments,
      refetch: refetchEnvironments
    } = useGetEnvironmentList({
      queryParams: envQueryParams,
      debounce: 250
    })

    const featureQueryParams: GetAllFeaturesQueryParams = {
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: formValuesRef.current?.spec?.environment || '',
      pageSize: 15,
      pageNumber: 0
    }

    const {
      data: featuresData,
      loading: loadingFeatures,
      error: errorFeatures,
      refetch: refetchFeatures
    } = useGetAllFeatures({ queryParams: featureQueryParams, debounce: 250 })

    const loading = loadingEnvironments || loadingFeatures
    const error = errorEnvironments || errorFeatures

    const showLoading = useMemo<boolean>(() => {
      if (isInitialRender) {
        if (!error) {
          setIsInitialRender(loading)
        }
        return loading
      }

      return false
    }, [isInitialRender, error, loading])

    const environmentItems = useMemo<SelectOption[]>(() => {
      if (!environmentsData?.data?.content?.length) {
        return []
      }

      return environmentsData.data.content.map(({ environment }) => ({
        label: environment?.name,
        value: environment?.identifier
      })) as SelectOption[]
    }, [environmentsData?.data?.content])

    const featureItems = useMemo<SelectOption[]>(() => {
      if (!featuresData?.features?.length) {
        return []
      }

      return featuresData.features.map(({ name, identifier }) => ({ label: name, value: identifier }))
    }, [featuresData?.features])

    if (showLoading) {
      return (
        <Container
          height="100%"
          width="100%"
          padding={{ top: 'huge' }}
          data-testid="flag-configuration-step-widget-loading"
        >
          <ContainerSpinner />
        </Container>
      )
    }

    if (error) {
      return (
        <Container padding={{ top: 'huge' }} data-testid="flag-configuration-step-widget-error">
          <PageError
            message={getErrorMessage(error)}
            width={450}
            onClick={() => {
              refetchFeatures()
              refetchEnvironments()
            }}
          />
        </Container>
      )
    }

    return (
      <Formik<FlagConfigurationStepData>
        formName="FeatureFlagConfigurationForm"
        onSubmit={onUpdate}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
          spec: Yup.object().shape({
            environment: Yup.string().required(getString('cf.pipeline.flagConfiguration.environmentRequired')),
            feature: Yup.mixed().required(getString('cf.pipeline.flagConfiguration.flagRequired'))
          })
        })}
      >
        {formik => {
          setFormikRef(formikRef, formik)
          const { values: formValues, setFieldValue } = formik
          formValuesRef.current = formValues

          const currentFeature = featuresData?.features?.find(
            ({ identifier }) => identifier === formValues?.spec.feature
          )

          const currentEnvironment = environmentsData?.data?.content?.find(
            ({ environment }) => environment?.identifier === formValues?.spec.environment
          )?.environment

          return (
            <Layout.Vertical padding={{ right: 'xlarge' }}>
              <FormInput.InputWithIdentifier
                isIdentifierEditable={isNewStep && !readonly}
                inputLabel={getString('cf.pipeline.flagConfiguration.stepName')}
                inputGroupProps={{ disabled: readonly }}
              />
              <FormInput.Select
                name="spec.environment"
                items={environmentItems}
                label={getString('cf.pipeline.flagConfiguration.selectEnvironment')}
                disabled={readonly}
                onQueryChange={searchTerm => refetchEnvironments({ queryParams: { ...envQueryParams, searchTerm } })}
              />
              <FormInput.MultiTypeInput
                name="spec.feature"
                useValue={true}
                selectItems={featureItems}
                label={getString('cf.pipeline.flagConfiguration.selectFlag')}
                disabled={readonly}
                multiTypeInputProps={{
                  disabled: readonly,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
                  onInput: event =>
                    refetchFeatures({
                      queryParams: { ...featureQueryParams, name: (event.target as HTMLInputElement).value }
                    })
                }}
              />

              <FlagChanges
                selectedFeature={
                  formValues.spec.feature === RUNTIME_INPUT_VALUE ? formValues.spec.feature : currentFeature
                }
                selectedEnvironmentId={currentEnvironment?.identifier}
                initialInstructions={initialValues.spec.instructions}
                clearField={(fieldName: string) => setFieldValue(fieldName, undefined)}
                setField={(fieldName: string, value: unknown) => setFieldValue(fieldName, value)}
                fieldValues={formValues}
                showRuntimeFixedSelector
              />
            </Layout.Vertical>
          )
        }}
      </Formik>
    )
  }
)

export default FlagConfigurationStepWidget
