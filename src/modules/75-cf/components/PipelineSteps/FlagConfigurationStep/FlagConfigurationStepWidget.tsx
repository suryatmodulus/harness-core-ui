import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  ButtonProps,
  Container,
  FlexExpander,
  Formik,
  FormInput,
  Icon,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  Select,
  SelectOption,
  Text
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { Link, useParams } from 'react-router-dom'
import { flatten, get } from 'lodash-es'
import type { SelectProps } from '@wings-software/uicore/dist/components/FormikForm/FormikForm'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import {
  CFEntityType,
  CF_DEFAULT_PAGE_SIZE,
  FeatureFlagActivationStatus,
  getErrorMessage,
  SEGMENT_PRIMARY_COLOR,
  TARGET_PRIMARY_COLOR
} from '@cf/utils/CFUtils'
import { useGetAllFeatures, useGetTargetsAndSegmentsInfo, Variation } from 'services/cf'
import { useStrings } from 'framework/strings'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import routes from '@common/RouteDefinitions'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { PageError } from '@common/components/Page/PageError'
import type { StringsMap } from 'stringTypes'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import {
  makeStackedCircleShortName,
  StackedCircleContainer
} from '@cf/components/StackedCircleContainer/StackedCircleContainer'
import {
  FlagConfigurationStepData,
  FlagConfigurationStepFormData,
  VariationMapping,
  CFPipelineInstructionType
} from './types'
import { VariationMappingModalButton } from './VariationMappingModalButton'
import css from './FlagConfigurationStepWidget.module.scss'

/**
 * Spec: https://harness.atlassian.net/wiki/spaces/FFM/pages/1446084831/APIs+for+creating+and+executing+Pipelines
 */
enum ConfigurationType {
  FIXED = 'FIXED',
  RUNTIME = 'RUNTIME'
}

export interface FlagConfigurationStepProps {
  initialValues: FlagConfigurationStepFormData
  isNewStep?: boolean
  isDisabled?: boolean
  onUpdate?: (data: FlagConfigurationStepFormData) => void
  stepViewType?: StepViewType
  readonly: boolean
}

// TODO: Conditional rules are not yet supported by backend
interface CustomRuleItem {
  name?: string
  value?: string
}

export function FlagConfigurationStepWidget(
  props: FlagConfigurationStepProps,
  formikRef: StepFormikFowardRef<FlagConfigurationStepData>
): React.ReactElement {
  const { getString } = useStrings()
  const { initialValues, onUpdate, isNewStep, isDisabled } = props
  const flagSwitchOptions: SelectOption[] = [
    { value: FeatureFlagActivationStatus.ON, label: getString('cf.shared.on') },
    { value: FeatureFlagActivationStatus.OFF, label: getString('cf.shared.off') }
  ]
  const stepString = (key: string): string => getString(`cf.pipeline.flagConfiguration.${key}` as keyof StringsMap)
  const configurationItems: SelectOption[] = [
    { label: stepString('fixedInput'), value: ConfigurationType.FIXED, icon: { name: 'fixed-input', size: 16 } },
    {
      label: stepString('runtimeInput'),
      value: ConfigurationType.RUNTIME,
      icon: { name: 'runtime-input', size: 16 }
    }
  ]
  const [environmentIdentifier, setEnvironmentIdentifier] = useState(initialValues.spec.environment)
  const {
    environments,
    loading: loadingEnvironments,
    error: errorEnvironments,
    refetch: refetchEnvironments
  } = useEnvironmentSelectV2({
    selectedEnvironmentIdentifier: initialValues.spec.environment,
    onChange: opt => {
      setEnvironmentIdentifier(opt.value as string)
    }
  })
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const queryParams = useMemo(
    () => ({
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: environmentIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      identifier: initialValues.spec.featureFlag
    }),
    [accountId, orgIdentifier, projectIdentifier, environmentIdentifier, initialValues.spec.featureFlag]
  )
  const {
    data: featuresData,
    loading: loadingFeatures,
    error: errorFeatures,
    refetch: refetchFeatures
  } = useGetAllFeatures({
    queryParams
  })
  const [flagSwitchAsRuntimeInput, setFlagSwitchAsRuntimeInput] = useState(false)
  const [serveVariationMappingAsRuntimeInput, setServeVariationMappingAsRuntimeInput] = useState(
    !!get(initialValues, 'spec.variationMappings')?.[RUNTIME_INPUT_VALUE]
  )
  const [customRulesAsRuntimeInput, setCustomRulesAsRuntimeInput] = useState(false)
  const [showVariationMapping, setShowVariationMapping] = useState(false)
  const [customRules, setCustomRules] = useState<CustomRuleItem[]>([])
  const formik = useRef<FormikProps<FlagConfigurationStepFormData> | null>(null)
  const isEverythingRuntime = (): boolean => initialValues.spec.state === RUNTIME_INPUT_VALUE
  const [selectedConfiguration, setSelectedConfiguration] = useState(configurationItems[isEverythingRuntime() ? 1 : 0])
  const [loadingFromFocus, setLoadingFromFocus] = useState(false)
  const targetAndTargetGroupIdentifiers = useMemo(() => {
    const _targetIdentifiers = new Set<string>()
    const _targetGroupIdentifiers = new Set<string>()
    const _variationMappings = initialValues.spec.variationMappings || {}

    Object.values(_variationMappings).forEach(variationMapping => {
      if (String(variationMapping.targets) !== RUNTIME_INPUT_VALUE) {
        variationMapping.targets?.forEach(({ identifier }) => {
          _targetIdentifiers.add(identifier)
        })
      }
      if (String(variationMapping.targetGroups) !== RUNTIME_INPUT_VALUE) {
        variationMapping.targetGroups?.forEach(({ identifier }) => {
          _targetGroupIdentifiers.add(identifier)
        })
      }
    })

    return {
      targetIdentifiers: Array.from(_targetIdentifiers),
      targetGroupIdentifiers: Array.from(_targetGroupIdentifiers)
    }
  }, [initialValues.spec.variationMappings])
  const {
    loading: loadingTargetsAndSegmentsInfo,
    data: targetsAndSegmentsInfo,
    error: errorTargetsAndSegmentsInfo,
    refetch: refetchTargetsAndSegmentsInfo
  } = useGetTargetsAndSegmentsInfo({
    queryParams: {
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: environmentIdentifier
    },
    lazy: true
  })

  const onConfigSubjectChanged: SelectProps['onChange'] = options => {
    setSelectedConfiguration(options)
    formik.current?.setFieldValue(
      'spec.state',
      options.value === ConfigurationType.RUNTIME ? RUNTIME_INPUT_VALUE : undefined
    )
  }

  const toggleFlagSwitch: ButtonProps['onClick'] = () => {
    formik.current?.setFieldValue('spec.state', !flagSwitchAsRuntimeInput ? RUNTIME_INPUT_VALUE : undefined)
    setFlagSwitchAsRuntimeInput(!flagSwitchAsRuntimeInput)
  }

  const toggleCustomRulesAsRuntimeInput: ButtonProps['onClick'] = () => {
    setCustomRulesAsRuntimeInput(!customRulesAsRuntimeInput)
  }

  const toggleServeVariationMappingAsRuntimeInput: ButtonProps['onClick'] = () => {
    setServeVariationMappingAsRuntimeInput(!serveVariationMappingAsRuntimeInput)

    if (!serveVariationMappingAsRuntimeInput) {
      formik.current?.setFieldValue('spec.variationMappings', RUNTIME_INPUT_VALUE)
    } else {
      formik.current?.setFieldValue('spec.variationMappings', {})
    }
  }

  useEffect(() => {
    if (initialValues?.spec?.environment && environments?.length) {
      const selectedEnvironment = environments.find(env => env.identifier === initialValues.spec.environment)

      if (selectedEnvironment) {
        formik.current?.setFieldValue('spec.environment', {
          label: selectedEnvironment.name,
          value: selectedEnvironment.identifier
        })
      }
    }

    if (initialValues?.spec?.featureFlag && featuresData?.features?.length) {
      const selectedFeature = featuresData.features.find(
        feature => feature.identifier === initialValues.spec.featureFlag
      )

      if (selectedFeature) {
        formik.current?.setFieldValue('spec.featureFlag', {
          label: selectedFeature.name,
          value: selectedFeature.identifier
        })
      }
    }
  }, [environments, featuresData, initialValues, formik])

  useEffect(() => {
    // Fetching target and target group info to fill in names for them in
    // variation mapping as in a pipeline, mapping has identifiers only
    if (
      !targetsAndSegmentsInfo &&
      !errorTargetsAndSegmentsInfo &&
      !loadingTargetsAndSegmentsInfo &&
      (targetAndTargetGroupIdentifiers?.targetIdentifiers?.length ||
        targetAndTargetGroupIdentifiers?.targetGroupIdentifiers?.length)
    ) {
      refetchTargetsAndSegmentsInfo({
        queryParams: {
          ...queryParams,
          targets: targetAndTargetGroupIdentifiers?.targetIdentifiers?.join(','),
          targetGroups: targetAndTargetGroupIdentifiers?.targetGroupIdentifiers?.join(',')
        }
      })
    }
  }, [
    initialValues,
    refetchTargetsAndSegmentsInfo,
    targetsAndSegmentsInfo,
    errorTargetsAndSegmentsInfo,
    loadingTargetsAndSegmentsInfo,
    queryParams,
    targetAndTargetGroupIdentifiers
  ])

  const scheduleSearchByFlagNameTimeoutRef = useRef(0)
  const scheduleSearchByFlagName = useCallback(
    name => {
      clearTimeout(scheduleSearchByFlagNameTimeoutRef.current)
      scheduleSearchByFlagNameTimeoutRef.current = window.setTimeout(() => {
        setLoadingFromFocus(true)
        refetchFeatures({ queryParams: { ...queryParams, name, identifier: undefined } }).finally(() => {
          setLoadingFromFocus(false)
        })
      }, 250)
    },
    [queryParams, refetchFeatures]
  )

  useEffect(() => {
    // Since target and target group are all identifiers inside a pipeline definition, in order to render
    // them properly, we need to fetch their info and update their names accordingly
    if (targetsAndSegmentsInfo?.entities?.length && formik.current) {
      const variationMappings = get(formik.current.values, 'spec.variationMappings')

      if (variationMappings !== RUNTIME_INPUT_VALUE) {
        Object.values(variationMappings as Record<string, VariationMapping>).forEach(_variationMapping => {
          _variationMapping.targets?.forEach(target => {
            const targetInfo = targetsAndSegmentsInfo.entities?.find(
              ({ identifier, type }) => identifier === target.identifier && type === CFEntityType.TARGET
            )
            if (targetInfo) {
              target.name = targetInfo.name as string
            }
          })

          _variationMapping.targetGroups?.forEach(targetGroup => {
            const targetGroupInfo = targetsAndSegmentsInfo.entities?.find(
              ({ identifier, type }) => identifier === targetGroup.identifier && type === CFEntityType.TARGET_GROUP
            )
            if (targetGroupInfo) {
              targetGroup.name = targetGroupInfo.name as string
            }
          })
        })

        formik.current.setFieldValue('spec.variationMappings', variationMappings)
      }
    }
  }, [targetsAndSegmentsInfo, formik.current]) // eslint-disable-line react-hooks/exhaustive-deps

  const loading = !loadingFromFocus && (loadingEnvironments || loadingFeatures || loadingTargetsAndSegmentsInfo)
  const error = errorEnvironments || errorFeatures || errorTargetsAndSegmentsInfo

  if (loading) {
    return (
      <Container height="100%" width="100%" padding={{ top: 'huge' }}>
        <ContainerSpinner />
      </Container>
    )
  }

  if (error) {
    return (
      <Container padding={{ top: 'huge' }}>
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
    <Formik<FlagConfigurationStepFormData>
      formName="FeatureFlagConfigurationForm"
      onSubmit={values => {
        onUpdate?.(values)
      }}
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
        spec: Yup.object().shape({
          environment: Yup.string().required(stepString('environmentRequired')),
          featureFlag: Yup.mixed().required(stepString('flagRequired')),
          state: Yup.mixed().required(stepString('flagState'))
        })
      })}
    >
      {(_formik: FormikProps<FlagConfigurationStepFormData>) => {
        setFormikRef(formikRef, _formik) // this is required
        formik.current = _formik

        const formEnvironmentIdentifier = get(_formik.values, 'spec.environment.value')
        const formFeatureFlagIdentifier = get(_formik.values, 'spec.featureFlag.value')
        const variationMappings = get(_formik.values, 'spec.variationMappings') as Record<string, VariationMapping>
        const isEnvironmentOrFeatureRuntimInput =
          get(_formik.values, 'spec.environment') === RUNTIME_INPUT_VALUE ||
          get(_formik.values, 'spec.featureFlag') === RUNTIME_INPUT_VALUE
        const selectedFeatureFlag = featuresData?.features?.find(
          ({ identifier }) => identifier === formFeatureFlagIdentifier
        )
        const hasVariationMappings = !!Object.keys(variationMappings || {}).length
        const selectedFeature = featuresData?.features?.find(
          feature => feature.identifier === initialValues.spec.featureFlag
        )
        const mappedVariationIdentifiers = Object.keys(variationMappings || {})
        const mappedTargetIdentifiers = flatten(
          Object.values(variationMappings || {}).map(({ targets }) => targets || [])
        ).map(entry => entry.identifier)
        const mappedTargetGroupIdentifiers = flatten(
          Object.values(variationMappings || {}).map(({ targetGroups }) => targetGroups || [])
        ).map(entry => entry.identifier)

        return (
          <Layout.Vertical padding={{ right: 'xlarge' }}>
            <FormInput.InputWithIdentifier
              isIdentifierEditable={isNewStep && !isDisabled}
              inputLabel={stepString('stepName')}
              inputGroupProps={{ disabled: isDisabled }}
            />
            <FormInput.MultiTypeInput
              name="spec.environment"
              selectItems={
                environments?.map<SelectOption>(env => ({
                  label: env.name as string,
                  value: env.identifier as string
                })) || []
              }
              label={stepString('selectEnvironment')}
              disabled={isDisabled}
              multiTypeInputProps={{
                disabled: isDisabled,
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
                onChange: opt => {
                  const resetVariationMapping =
                    opt === RUNTIME_INPUT_VALUE ||
                    !opt ||
                    get(opt, 'value') !== formEnvironmentIdentifier ||
                    !formFeatureFlagIdentifier

                  if (resetVariationMapping) {
                    _formik.setFieldValue('spec.variationMappings', undefined)
                    if (opt === RUNTIME_INPUT_VALUE) {
                      setServeVariationMappingAsRuntimeInput(true)
                    }
                  }
                }
              }}
            />
            <FormInput.MultiTypeInput
              name="spec.featureFlag"
              selectItems={
                featuresData?.features?.map(({ identifier: value, name: label }) => ({ value, label })) || []
              }
              label={
                (
                  <Container flex>
                    <Text>{stepString('selectFlag')}</Text>
                    <FlexExpander />
                    {!!formFeatureFlagIdentifier && (
                      <Link
                        to={
                          routes.toCFFeatureFlagsDetail({
                            accountId,
                            orgIdentifier: orgIdentifier as string,
                            projectIdentifier: projectIdentifier as string,
                            featureFlagIdentifier: formFeatureFlagIdentifier
                          }) + `${formEnvironmentIdentifier ? `?activeEnvironment=${formEnvironmentIdentifier}` : ''}`
                        }
                        target="_blank"
                        style={{ fontSize: 'var(--font-size-small)' }}
                      >
                        {stepString('viewDetail')}
                      </Link>
                    )}
                  </Container>
                ) as unknown as string
              }
              disabled={isDisabled}
              multiTypeInputProps={{
                disabled: isDisabled,
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
                onInput: event => {
                  scheduleSearchByFlagName(get(event, 'target.value'))
                },
                onFocus: async () => {
                  if (formFeatureFlagIdentifier) {
                    setLoadingFromFocus(true)
                    await refetchFeatures({ queryParams: { ...queryParams, identifier: undefined } })
                    setLoadingFromFocus(false)
                  }
                }
              }}
            />

            <Layout.Horizontal padding={{ top: 'medium', bottom: 'large' }} style={{ alignItems: 'center' }}>
              <Text width="70%" style={{ color: '#22222A', fontSize: '14px', fontWeight: 600 }}>
                {stepString('whatToConfigure')}
              </Text>
              <Select value={selectedConfiguration} items={configurationItems} onChange={onConfigSubjectChanged} />
            </Layout.Horizontal>

            {selectedConfiguration.value === ConfigurationType.RUNTIME ? (
              <AllSetToRuntimeInputLabel message={stepString('allRuntimeInput')} />
            ) : (
              <>
                <Container className={css.borderedContainer} padding="large">
                  <Layout.Horizontal margin={{ bottom: 'small' }}>
                    <Text style={{ fontWeight: 600, fontSize: '13px', color: '#22222A' }}>
                      {stepString('flagSwitch')}
                    </Text>
                    <FlexExpander />
                    <Button
                      noStyling
                      onClick={toggleFlagSwitch}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transform: 'translateY(-5px)'
                      }}
                    >
                      <Icon
                        name={flagSwitchAsRuntimeInput ? 'runtime-input' : 'fixed-input'}
                        size={14}
                        style={{
                          color: flagSwitchAsRuntimeInput ? 'var(--purple-500)' : 'var(--primary-7)'
                        }}
                      />
                    </Button>
                  </Layout.Horizontal>

                  {flagSwitchAsRuntimeInput ? (
                    <RuntimeInputLabel message={stepString('flagSwitchRuntime')} />
                  ) : (
                    <>
                      <Layout.Vertical>
                        <FormInput.Select name="spec.state" items={flagSwitchOptions} label={stepString('switchTo')} />

                        {/* Not yet supported by backend */}
                        {/* <FormInput.Select
                          name="spec.defaultVariation"
                          items={testFlags}
                          label={'Default Variation When The Flag is ON'}
                        /> */}
                      </Layout.Vertical>
                    </>
                  )}
                </Container>

                {(showVariationMapping || variationMappings) && (
                  <Container
                    style={{ '--layout-spacing': 'var(--spacing-main)', position: 'relative' } as React.CSSProperties}
                  >
                    <Container className={css.borderedContainer} padding="large">
                      <Layout.Horizontal margin={{ bottom: 'small' }}>
                        <Text style={{ fontWeight: 600, fontSize: '13px', color: '#22222A' }}>
                          {stepString('serveMapping')}
                        </Text>
                        <FlexExpander />
                        <Button
                          noStyling
                          onClick={toggleServeVariationMappingAsRuntimeInput}
                          disabled={serveVariationMappingAsRuntimeInput && isEnvironmentOrFeatureRuntimInput}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            transform: 'translateY(-5px)'
                          }}
                        >
                          <Icon
                            name={serveVariationMappingAsRuntimeInput ? 'runtime-input' : 'fixed-input'}
                            size={14}
                            style={{
                              color: serveVariationMappingAsRuntimeInput ? 'var(--purple-500)' : 'var(--primary-7)'
                            }}
                          />
                        </Button>
                      </Layout.Horizontal>

                      {serveVariationMappingAsRuntimeInput ? (
                        <RuntimeInputLabel message={stepString('variationMappingRuntime')} />
                      ) : (
                        <Layout.Vertical spacing="small">
                          <Container
                            style={{
                              borderRadius: '4px',
                              boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                              padding: 'var(--spacing-xsmall) 0'
                            }}
                          >
                            {hasVariationMappings && (
                              <Container padding="medium">
                                {Object.values(variationMappings).map((variationMapping, index) => {
                                  const variationIndex = selectedFeatureFlag?.variations.findIndex(
                                    ({ identifier }) => identifier === variationMapping.variationIdentifier
                                  ) as number
                                  const variation: Variation = selectedFeatureFlag?.variations?.[
                                    variationIndex
                                  ] as Variation
                                  const stackedItems = (variationMapping.targets || [])
                                    .map(({ identifier, name }) => ({
                                      name,
                                      identifier: `${CFEntityType.TARGET}-${identifier}`,
                                      type: CFEntityType.TARGET
                                    }))
                                    .concat(
                                      (variationMapping.targetGroups || []).map(({ identifier, name }) => ({
                                        name,
                                        identifier: `${CFEntityType.TARGET_GROUP}-${identifier}`,
                                        type: CFEntityType.TARGET_GROUP
                                      }))
                                    )
                                  return (
                                    <Container
                                      key={variationMapping.variationIdentifier}
                                      margin={{ top: index ? 'large' : undefined }}
                                    >
                                      <Layout.Horizontal spacing="xsmall">
                                        <Text>{stepString('serve')}</Text>
                                        <Container style={{ display: 'flex', alignItems: 'center' }}>
                                          <VariationWithIcon
                                            variation={variation}
                                            index={variationIndex}
                                            textStyle={{
                                              fontWeight: 600,
                                              color: 'var(--black)',
                                              paddingLeft: 'var(--spacing-xsmall)'
                                            }}
                                          />
                                        </Container>
                                        <Text>{stepString('toGroups')}</Text>
                                      </Layout.Horizontal>
                                      <Layout.Horizontal spacing="small" style={{ alignItems: 'baseline' }}>
                                        <StackedCircleContainer
                                          maxShownItem={10}
                                          items={stackedItems}
                                          keyOfItem={item => item.identifier}
                                          renderItem={item => (
                                            <Text tooltip={item.name}>{makeStackedCircleShortName(item.name)}</Text>
                                          )}
                                          backgroundColor={item =>
                                            get(item, 'type') === CFEntityType.TARGET_GROUP
                                              ? SEGMENT_PRIMARY_COLOR
                                              : TARGET_PRIMARY_COLOR
                                          }
                                          margin={{ top: 'medium' }}
                                        />
                                        <Text>({stackedItems.length})</Text>
                                        <FlexExpander />

                                        <Layout.Horizontal inline>
                                          <VariationMappingModalButton
                                            accountId={accountId}
                                            orgIdentifier={orgIdentifier}
                                            projectIdentifier={projectIdentifier}
                                            environmentIdentifier={formEnvironmentIdentifier}
                                            featureFlagIdentifier={formFeatureFlagIdentifier}
                                            modalTitle={stepString('editVariationMappingTitle')}
                                            minimal
                                            style={{ paddingRight: 'var(--spacing-xsmall)' }}
                                            icon="edit"
                                            variationIdentifier={variationMapping.variationIdentifier}
                                            targets={variationMapping.targets}
                                            targetGroups={variationMapping.targetGroups}
                                            excludeVariationIdentifiers={mappedVariationIdentifiers.filter(
                                              mappedIdentifier =>
                                                mappedIdentifier !== variationMapping.variationIdentifier
                                            )}
                                            excludeTargetIdentifiers={mappedTargetIdentifiers.filter(
                                              mappedIdentifier =>
                                                !variationMapping.targets?.find(
                                                  ({ identifier }) => mappedIdentifier === identifier
                                                )
                                            )}
                                            excludeTargetGroupIdentifiers={mappedTargetGroupIdentifiers.filter(
                                              mappedIdentifier =>
                                                !variationMapping.targetGroups?.find(
                                                  ({ identifier }) => mappedIdentifier === identifier
                                                )
                                            )}
                                            onSubmit={(targets, targetGroups, variationIdentifier) => {
                                              const _variationMappings: Record<string, VariationMapping> =
                                                variationMappings || {}

                                              _variationMappings[variationIdentifier] = {
                                                variationIdentifier,
                                                instructionType:
                                                  CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
                                                targets,
                                                targetGroups
                                              }

                                              _formik.setFieldValue('spec.variationMappings', _variationMappings)
                                            }}
                                            disabled={
                                              isEnvironmentOrFeatureRuntimInput ||
                                              !formEnvironmentIdentifier ||
                                              !formFeatureFlagIdentifier
                                            }
                                          />
                                          <Button
                                            minimal
                                            // intent="primary"
                                            icon="trash"
                                            onClick={() => {
                                              delete variationMappings[variationMapping.variationIdentifier]
                                              _formik.setFieldValue('spec.variationMappings', variationMappings)
                                            }}
                                          />
                                        </Layout.Horizontal>
                                      </Layout.Horizontal>
                                    </Container>
                                  )
                                })}
                              </Container>
                            )}

                            {/* Allow "Add new variation" mapping only when there is still variation available to be mapped */}
                            {(selectedFeature?.variations?.length || 0) >
                              Object.keys(variationMappings || {}).length && (
                              <VariationMappingModalButton
                                accountId={accountId}
                                orgIdentifier={orgIdentifier}
                                projectIdentifier={projectIdentifier}
                                environmentIdentifier={formEnvironmentIdentifier}
                                featureFlagIdentifier={formFeatureFlagIdentifier}
                                modalTitle={stepString('addVariationMappingTitle')}
                                minimal
                                intent="primary"
                                text={stepString(hasVariationMappings ? 'addNewMapping' : 'addEditMapping')}
                                excludeVariationIdentifiers={mappedVariationIdentifiers}
                                excludeTargetIdentifiers={mappedTargetIdentifiers}
                                excludeTargetGroupIdentifiers={mappedTargetGroupIdentifiers}
                                onSubmit={(targets, targetGroups, variationIdentifier) => {
                                  const _variationMappings: Record<string, VariationMapping> = variationMappings || {}

                                  _variationMappings[variationIdentifier] = {
                                    variationIdentifier,
                                    instructionType: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
                                    targets,
                                    targetGroups
                                  }

                                  _formik.setFieldValue('spec.variationMappings', _variationMappings)
                                }}
                                disabled={
                                  isEnvironmentOrFeatureRuntimInput ||
                                  !formEnvironmentIdentifier ||
                                  !formFeatureFlagIdentifier
                                }
                              />
                            )}
                          </Container>

                          {/* This is not yet supported by backend
                          <Container
                            style={{
                              borderRadius: '4px',
                              boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                              padding: 'var(--spacing-xsmall) 0'
                            }}
                          >
                            <Button
                              minimal
                              intent="primary"
                              text={stepString('removeMapping')}
                              onClick={() => alert('This feature is not yet supported')}
                            />
                          </Container> */}
                        </Layout.Vertical>
                      )}
                    </Container>
                    <Button
                      minimal
                      icon="trash"
                      onClick={() => {
                        _formik.setFieldValue('spec.variationMappings', undefined)
                        setShowVariationMapping(false)
                      }}
                      style={{ position: 'absolute', right: '-42px', top: 'calc(50% - 20px)' }}
                    />
                  </Container>
                )}

                {customRules.length > 0 && (
                  <Container
                    className={css.borderedContainer}
                    padding="large"
                    style={{ '--layout-spacing': 'var(--spacing-main)' } as React.CSSProperties}
                  >
                    <Layout.Horizontal margin={{ bottom: 'small' }}>
                      <Text style={{ fontWeight: 600, fontSize: '13px', color: '#22222A' }}>
                        {stepString('conditionalRules')}
                      </Text>
                      <FlexExpander />
                      <Button
                        noStyling
                        onClick={toggleCustomRulesAsRuntimeInput}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          transform: 'translateY(-5px)'
                        }}
                      >
                        <Icon
                          name={customRulesAsRuntimeInput ? 'runtime-input' : 'fixed-input'}
                          size={14}
                          style={{
                            color: customRulesAsRuntimeInput ? 'var(--purple-500)' : 'var(--primary-7)'
                          }}
                        />
                      </Button>
                    </Layout.Horizontal>

                    {customRulesAsRuntimeInput ? (
                      <RuntimeInputLabel message={stepString('conditionRuntime')} />
                    ) : (
                      <Layout.Vertical spacing="small">
                        <Container
                          style={{
                            borderRadius: '4px',
                            boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                            padding: 'var(--spacing-xsmall) 0'
                          }}
                        >
                          <Button minimal intent="primary" text={stepString('addOrEdit')} />
                        </Container>
                        <Container
                          style={{
                            borderRadius: '4px',
                            boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
                            padding: 'var(--spacing-xsmall) 0'
                          }}
                        >
                          <Button minimal intent="primary" text={stepString('remove')} />
                        </Container>
                      </Layout.Vertical>
                    )}
                  </Container>
                )}

                <Container padding={{ top: 'medium' }}>
                  {!showVariationMapping && !variationMappings && (
                    <Container>
                      <Button
                        minimal
                        intent="primary"
                        text={stepString('configureMore')}
                        style={{ padding: 0 }}
                        onClick={() => {
                          setShowVariationMapping(true)
                        }}
                      />
                    </Container>
                  )}

                  {/* Disable now since backend does not support it yet */}
                  {false && !customRules.length && (
                    <Container>
                      <Button
                        minimal
                        intent="primary"
                        text={stepString('addConditionalRules')}
                        style={{ padding: 0 }}
                        onClick={() => {
                          setCustomRules([...customRules, {}])
                        }}
                      />
                    </Container>
                  )}
                </Container>
              </>
            )}
          </Layout.Vertical>
        )
      }}
    </Formik>
  )
}

const AllSetToRuntimeInputLabel: React.FC<{ message: string }> = ({ message }) => (
  <Container padding="large" style={{ border: '1px solid #DDD', borderRadius: '5px' }}>
    <Text style={{ fontSize: '14px', color: '#9293AB', fontWeight: 400, lineHeight: '22px' }}>{message}</Text>
  </Container>
)

const RuntimeInputLabel: React.FC<{ message: string }> = ({ message }) => (
  <Container padding="large" style={{ border: '1px solid #DDD', borderRadius: '5px', background: '#F9F9F9' }}>
    <Text style={{ fontSize: '14px', color: '#9293AB', fontWeight: 400, lineHeight: '22px' }}>{message}</Text>
  </Container>
)

export const FlagConfigurationStepWidgetWithRef = React.forwardRef(FlagConfigurationStepWidget)
