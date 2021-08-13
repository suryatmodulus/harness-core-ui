import React, { useMemo } from 'react'
import * as yup from 'yup'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { Layout, Formik, FormikForm, FormInput, Text, Card, Accordion } from '@wings-software/uicore'
import { isEmpty, isUndefined, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { produce } from 'immer'
import type { FormikProps } from 'formik'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getStageIndexFromPipeline,
  getFlattenedStages
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import type { MultiTypeMapType, MultiTypeMapUIType, MapType } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { useGitScope } from '@ci/services/CIUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { K8sDirectInfraYaml, UseFromStageInfraYaml } from 'services/ci'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { BuildTabs } from '../CIPipelineStagesUtils'
import css from './BuildInfraSpecifications.module.scss'

const logger = loggerFor(ModuleName.CD)

const getInitialMapValues: (value: MultiTypeMapType) => MultiTypeMapUIType = value => {
  const map =
    typeof value === 'string'
      ? value
      : Object.keys(value || {}).map(key => ({
          id: uuid('', nameSpace()),
          key: key,
          value: value[key]
        }))

  return map
}

const getMapValues: (value: MultiTypeMapUIType) => MultiTypeMapType = value => {
  const map: MapType = {}
  if (Array.isArray(value)) {
    value.forEach(mapValue => {
      if (mapValue.key) {
        map[mapValue.key] = mapValue.value
      }
    })
  }

  return typeof value === 'string' ? value : map
}

const testLabelKey = (value: string): boolean => {
  return (
    ['accountid', 'orgid', 'projectid', 'pipelineid', 'pipelineexecutionid', 'stageid', 'buildnumber'].indexOf(
      value.toLowerCase()
    ) === -1
  )
}

const getValidationSchema = (getString?: UseStringsReturn['getString']): yup.Schema<unknown> =>
  yup.object().shape({
    connectorRef: yup.mixed().when(['useFromStage'], {
      is: isEmpty,
      then: yup.mixed().required(getString?.('fieldRequired', { field: getString?.('connectors.title.k8sCluster') })),
      otherwise: yup.mixed()
    }),
    namespace: yup.string().when(['useFromStage'], {
      is: isEmpty,
      then: yup
        .string()
        .trim()
        .required(
          getString?.('fieldRequired', { field: getString?.('pipelineSteps.build.infraSpecifications.namespace') })
        ),
      otherwise: yup.string().nullable()
    }),
    runAsUser: yup.string().test(
      'Must be a number and allows runtimeinput or expression',
      getString?.('pipeline.stepCommonFields.validation.mustBeANumber', {
        label: getString?.('pipeline.stepCommonFields.runAsUser')
      }) || '',
      function (runAsUser) {
        if (isUndefined(runAsUser) || !runAsUser) {
          return true
        } else if (runAsUser.startsWith('<+')) {
          return true
        }
        return !isNaN(runAsUser)
      }
    )
  })

interface Values {
  connectorRef?: string
  namespace?: string
  serviceAccountName?: string
  runAsUser?: string
  initTimeout?: string
  useFromStage?: string
  annotations?: MultiTypeMapUIType
  labels?: MultiTypeMapUIType
}

enum Modes {
  Propagate,
  NewConfiguration
}

export default function BuildInfraSpecifications({ children }: React.PropsWithChildren<unknown>): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const gitScope = useGitScope()

  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    isReadonly,
    updateStage,
    getStageFromPipeline
  } = React.useContext(PipelineContext)

  const { stage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  const [currentMode, setCurrentMode] = React.useState(() =>
    (stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage
      ? Modes.Propagate
      : Modes.NewConfiguration
  )

  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { stages } = getFlattenedStages(pipeline)
  const { stage: propagatedStage } = getStageFromPipeline<BuildStageElementConfig>(
    (stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage || ''
  )

  const otherBuildStagesWithInfraConfigurationOptions: { label: string; value: string }[] = []

  if (stages && stages.length > 0) {
    stages.forEach((item, index) => {
      if (
        index < stageIndex &&
        item.stage?.type === 'CI' &&
        ((item.stage as BuildStageElementConfig)?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
      ) {
        otherBuildStagesWithInfraConfigurationOptions.push({
          label: `Stage ${item.stage.name}`,
          value: item.stage.identifier
        })
      }
    })
  }

  const connectorId = ((stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef as string) || ''

  const getInitialValues = useMemo((): Values => {
    if (stage?.stage?.spec?.infrastructure) {
      if ((stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage) {
        return {
          useFromStage: (stage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage
        }
      } else if (!isEmpty(connectorId)) {
        return {
          connectorRef: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef,
          namespace: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace,
          serviceAccountName: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.serviceAccountName,
          runAsUser: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.runAsUser as unknown as string,
          initTimeout: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.initTimeout,
          annotations: getInitialMapValues(
            (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.annotations || {}
          ),
          labels: getInitialMapValues((stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.labels || {})
        }
      } else {
        return {
          connectorRef: undefined,
          namespace: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace,
          serviceAccountName: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.serviceAccountName,
          runAsUser: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.runAsUser as unknown as string,
          initTimeout: (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.initTimeout,
          annotations: getInitialMapValues(
            (stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.annotations || {}
          ),
          labels: getInitialMapValues((stage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.labels || {})
        }
      }
    } else {
      return {
        connectorRef: undefined,
        namespace: '',
        annotations: '',
        labels: ''
      }
    }
  }, [stage])

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: BuildTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: BuildTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  const handleValidate = (values: any): void => {
    if (stage) {
      const errors: { [key: string]: string } = {}
      const stageData = produce(stage, draft => {
        if (currentMode === Modes.Propagate && values.useFromStage) {
          set(draft, 'stage.spec.infrastructure', {
            useFromStage: values.useFromStage
          })
        } else {
          const filteredLabels = getMapValues(
            Array.isArray(values.labels) ? values.labels.filter((val: any) => testLabelKey(val.key)) : values.labels
          )
          try {
            getDurationValidationSchema().validateSync(values.initTimeout)
          } catch (e) {
            errors.initTimeout = e.message
          }
          set(draft, 'stage.spec.infrastructure', {
            type: 'KubernetesDirect',
            spec: {
              connectorRef:
                values?.connectorRef?.value ||
                values?.connectorRef ||
                (draft.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef,
              namespace: values.namespace,
              serviceAccountName: values.serviceAccountName,
              runAsUser: values.runAsUser,
              initTimeout: errors.initTimeout ? undefined : values.initTimeout,
              annotations: getMapValues(values.annotations),
              labels: !isEmpty(filteredLabels) ? filteredLabels : undefined
            }
          })

          if (
            !values.annotations ||
            !values.annotations.length ||
            (values.annotations.length === 1 && !values.annotations[0].key)
          ) {
            delete (draft.stage?.spec?.infrastructure as K8sDirectInfraYaml).spec.annotations
          }
        }
      })

      if (stageData.stage) {
        updateStage(stageData.stage)
      }

      return values.labels?.reduce?.((acc: Record<string, string>, curr: any, index: number) => {
        if (!testLabelKey(curr.key)) {
          acc[`labels[${index}].key`] = curr.key + ' is not allowed.'
        }
        return acc
      }, errors)
    }
  }

  return (
    <div className={css.wrapper}>
      <ErrorsStripBinded />
      <div className={css.contentSection} ref={scrollRef}>
        <Formik
          initialValues={getInitialValues}
          validationSchema={getValidationSchema(getString)}
          validate={handleValidate}
          formName="ciBuildInfra"
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {formik => {
            const { setFieldValue } = formik
            window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: BuildTabs.INFRASTRUCTURE }))
            formikRef.current = formik
            return (
              <Layout.Vertical>
                <div className={css.tabHeading} id="infrastructureDefinition">
                  {getString('pipelineSteps.build.infraSpecifications.whereToRun')}
                </div>
                <FormikForm>
                  {otherBuildStagesWithInfraConfigurationOptions.length ? (
                    <Card disabled={isReadonly} className={cx(css.sectionCard)}>
                      <Layout.Horizontal spacing="xxlarge">
                        <div
                          className={cx(css.card, { [css.active]: currentMode === Modes.Propagate })}
                          style={{ width: 410 }}
                          onClick={() => setCurrentMode(Modes.Propagate)}
                        >
                          <Text className={css.cardTitle} font="normal" color="black" margin={{ bottom: 'large' }}>
                            {getString('pipelineSteps.build.infraSpecifications.propagate')}
                          </Text>
                          <FormInput.Select
                            name="useFromStage"
                            items={otherBuildStagesWithInfraConfigurationOptions}
                            disabled={isReadonly}
                          />
                          {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef && (
                            <>
                              <Text font="small" margin={{ top: 'large', bottom: 'xsmall' }}>
                                {getString('connectors.title.k8sCluster')}
                              </Text>
                              <Text font="normal" color="black" margin={{ bottom: 'medium' }}>
                                {
                                  (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                    ?.connectorRef
                                }
                              </Text>
                            </>
                          )}
                          {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace && (
                            <>
                              <Text font="small" margin={{ bottom: 'xsmall' }}>
                                {getString('pipelineSteps.build.infraSpecifications.namespace')}
                              </Text>
                              <Text font="normal" color="black" margin={{ bottom: 'medium' }}>
                                {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.namespace}
                              </Text>
                            </>
                          )}
                          {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.annotations && (
                            <>
                              <Text font="small" margin={{ bottom: 'xsmall' }}>
                                {getString('ci.annotations')}
                              </Text>
                              {typeof (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                ?.annotations === 'string' ? (
                                <Text font="normal" color="black">
                                  {
                                    (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                      .annotations
                                  }
                                </Text>
                              ) : (
                                <ul className={css.plainList}>
                                  {Object.entries(
                                    (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                      ?.annotations || {}
                                  ).map((entry, idx) => (
                                    <li key={idx}>
                                      <Text font="normal" color="black">
                                        {entry[0]}:{entry[1]}
                                      </Text>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          )}
                          {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.labels && (
                            <>
                              <Text font="small" margin={{ bottom: 'xsmall' }}>
                                {getString('ci.labels')}
                              </Text>
                              {typeof (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                ?.labels === 'string' ? (
                                <Text font="normal" color="black">
                                  {(propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec?.labels}
                                </Text>
                              ) : (
                                <ul className={css.plainList}>
                                  {Object.entries(
                                    (propagatedStage?.stage?.spec?.infrastructure as K8sDirectInfraYaml)?.spec
                                      ?.labels || {}
                                  ).map((entry, idx) => (
                                    <li key={idx}>
                                      <Text font="normal" color="black">
                                        {entry[0]}:{entry[1]}
                                      </Text>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          )}
                        </div>

                        <div
                          className={cx(css.card, { [css.active]: currentMode === Modes.NewConfiguration })}
                          style={{ width: 460 }}
                          onClick={() => {
                            setCurrentMode(Modes.NewConfiguration)

                            if (currentMode === Modes.Propagate) {
                              const newStageData = produce(stage, draft => {
                                if (draft) {
                                  set(draft, 'stage.spec.infrastructure', {
                                    type: 'KubernetesDirect',
                                    spec: {
                                      connectorRef: '',
                                      namespace: '',
                                      annotations: {},
                                      labels: {}
                                    }
                                  })
                                }
                              })
                              setFieldValue('useFromStage', undefined)

                              if (newStageData?.stage) {
                                updateStage(newStageData.stage)
                              }
                            }
                          }}
                        >
                          <Text className={css.cardTitle} font="normal" color="black" margin={{ bottom: 'large' }}>
                            {getString('pipelineSteps.build.infraSpecifications.newConfiguration')}
                          </Text>
                          <Text font="small" margin={{ bottom: 'xsmall' }}>
                            {getString('connectors.title.k8sCluster')}
                          </Text>
                          <FormMultiTypeConnectorField
                            width={300}
                            name="connectorRef"
                            label={''}
                            placeholder={getString('select')}
                            accountIdentifier={accountId}
                            projectIdentifier={projectIdentifier}
                            orgIdentifier={orgIdentifier}
                            gitScope={gitScope}
                            multiTypeProps={{ expressions, disabled: isReadonly }}
                          />
                          <Text
                            font="small"
                            margin={{ bottom: 'xsmall' }}
                            tooltipProps={{ dataTooltipId: 'namespace' }}
                          >
                            {getString('pipelineSteps.build.infraSpecifications.namespace')}
                          </Text>
                          <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                            <FormInput.MultiTextInput
                              label=""
                              name={'namespace'}
                              placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
                              style={{ width: 300 }}
                              multiTextInputProps={{ expressions, disabled: isReadonly }}
                            />
                          </div>
                          <FormInput.MultiTextInput
                            label={getString('pipeline.infraSpecifications.serviceAccountName')}
                            name="serviceAccountName"
                            placeholder={getString('pipeline.infraSpecifications.serviceAccountNamePlaceholder')}
                            style={{
                              width: 300,
                              marginTop: 'var(--spacing-small)',
                              marginBottom: 'var(--spacing-xsmall)'
                            }}
                            multiTextInputProps={{ expressions, disabled: isReadonly }}
                          />
                          <MultiTypeTextField
                            label={
                              <Text margin={{ bottom: 'xsmall' }}>
                                {getString('pipeline.stepCommonFields.runAsUser')}
                              </Text>
                            }
                            name="runAsUser"
                            style={{ width: 300, marginBottom: 'var(--spacing-xsmall)' }}
                            multiTextInputProps={{
                              multiTextInputProps: { expressions },
                              disabled: isReadonly,
                              placeholder: '1000'
                            }}
                          />
                          <FormMultiTypeDurationField
                            name="initTimeout"
                            multiTypeDurationProps={{ expressions }}
                            label={
                              <Text
                                flex={{ justifyContent: 'start' }}
                                font="small"
                                tooltipProps={{ dataTooltipId: 'timeout' }}
                              >
                                {getString('pipeline.infraSpecifications.initTimeout')}
                              </Text>
                            }
                            disabled={isReadonly}
                            style={{ width: 300 }}
                          />
                          <MultiTypeMap
                            style={{ marginTop: 'var(--spacing-medium)' }}
                            appearance="minimal"
                            name="annotations"
                            valueMultiTextInputProps={{ expressions }}
                            multiTypeFieldSelectorProps={{
                              label: (
                                <Text font="small" margin={{ bottom: 'xsmall' }}>
                                  {getString('ci.annotations')}
                                </Text>
                              ),
                              disableTypeSelection: true
                            }}
                            disabled={isReadonly}
                            enableConfigureOptions={false}
                          />
                          <MultiTypeMap
                            style={{ marginTop: 'var(--spacing-medium)' }}
                            appearance="minimal"
                            name="labels"
                            valueMultiTextInputProps={{ expressions }}
                            multiTypeFieldSelectorProps={{
                              label: (
                                <Text font="small" margin={{ bottom: 'xsmall' }}>
                                  {getString('ci.labels')}
                                </Text>
                              ),
                              disableTypeSelection: true
                            }}
                            enableConfigureOptions={false}
                            disabled={isReadonly}
                          />
                        </div>
                      </Layout.Horizontal>
                    </Card>
                  ) : (
                    <>
                      <Card disabled={isReadonly} className={cx(css.sectionCard)}>
                        <FormMultiTypeConnectorField
                          width={300}
                          name="connectorRef"
                          label={getString('connectors.title.k8sCluster')}
                          placeholder={getString(
                            'pipelineSteps.build.infraSpecifications.kubernetesClusterPlaceholder'
                          )}
                          accountIdentifier={accountId}
                          projectIdentifier={projectIdentifier}
                          orgIdentifier={orgIdentifier}
                          gitScope={gitScope}
                          multiTypeProps={{ expressions, disabled: isReadonly }}
                        />
                        <Text margin={{ bottom: 'xsmall' }} tooltipProps={{ dataTooltipId: 'namespace' }}>
                          {getString('pipelineSteps.build.infraSpecifications.namespace')}
                        </Text>
                        <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                          <MultiTypeTextField
                            label=""
                            name={'namespace'}
                            style={{ width: 300 }}
                            multiTextInputProps={{
                              multiTextInputProps: { expressions },
                              disabled: isReadonly,
                              placeholder: getString('pipeline.infraSpecifications.namespacePlaceholder')
                            }}
                          />
                        </div>
                      </Card>
                      <Accordion activeId={''}>
                        <Accordion.Panel
                          id="advanced"
                          addDomId={true}
                          summary={getString('advancedTitle')}
                          details={
                            <Card disabled={isReadonly} className={css.sectionCard}>
                              <MultiTypeTextField
                                label={
                                  <Text margin={{ bottom: 'xsmall' }}>
                                    {getString('pipeline.infraSpecifications.serviceAccountName')}
                                  </Text>
                                }
                                name="serviceAccountName"
                                style={{ width: 300, marginBottom: 'var(--spacing-small)' }}
                                multiTextInputProps={{
                                  multiTextInputProps: { expressions },
                                  disabled: isReadonly,
                                  placeholder: getString('pipeline.infraSpecifications.namespacePlaceholder')
                                }}
                              />
                              <MultiTypeTextField
                                label={
                                  <Text margin={{ bottom: 'xsmall' }}>
                                    {getString('pipeline.stepCommonFields.runAsUser')}
                                  </Text>
                                }
                                name="runAsUser"
                                style={{ width: 300, marginBottom: 'var(--spacing-xsmall)' }}
                                multiTextInputProps={{
                                  multiTextInputProps: { expressions },
                                  disabled: isReadonly,
                                  placeholder: '1000'
                                }}
                              />
                              <FormMultiTypeDurationField
                                name="initTimeout"
                                multiTypeDurationProps={{ expressions }}
                                label={
                                  <Text flex={{ justifyContent: 'start' }} tooltipProps={{ dataTooltipId: 'timeout' }}>
                                    {getString('pipeline.infraSpecifications.initTimeout')}
                                  </Text>
                                }
                                disabled={isReadonly}
                                style={{ width: 300 }}
                              />
                              <MultiTypeMap
                                style={{ marginTop: 'var(--spacing-medium)' }}
                                appearance={'minimal'}
                                cardStyle={{ width: '50%' }}
                                name="annotations"
                                valueMultiTextInputProps={{ expressions }}
                                multiTypeFieldSelectorProps={{
                                  label: <Text>{getString('ci.annotations')}</Text>,
                                  disableTypeSelection: true
                                }}
                                disabled={isReadonly}
                              />
                              <MultiTypeMap
                                style={{ marginTop: 'var(--spacing-medium)' }}
                                appearance={'minimal'}
                                cardStyle={{ width: '50%' }}
                                name="labels"
                                valueMultiTextInputProps={{ expressions }}
                                multiTypeFieldSelectorProps={{
                                  label: <Text>{getString('ci.labels')}</Text>,
                                  disableTypeSelection: true
                                }}
                                disabled={isReadonly}
                              />
                            </Card>
                          }
                        />
                      </Accordion>
                    </>
                  )}
                </FormikForm>
              </Layout.Vertical>
            )
          }}
        </Formik>
        <div className={css.navigationButtons}>{children}</div>
      </div>
    </div>
  )
}
