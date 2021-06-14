import React, { useMemo } from 'react'
import * as yup from 'yup'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { Layout, Formik, FormikForm, FormInput, Text, Card, Accordion } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { useStrings } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getStageIndexFromPipeline,
  getFlattenedStages
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import type { MultiTypeMapType, MultiTypeMapUIType, MapType } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
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

const validationSchema = yup.object().shape({
  connectorRef: yup.mixed().required(),
  namespace: yup.string().trim().required()
})

interface Values {
  connectorRef?: ConnectorReferenceFieldProps['selected'] | string
  namespace?: string
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
    getStageFromPipeline,
    updatePipeline
  } = React.useContext(PipelineContext)

  const { stage = {} } = getStageFromPipeline(selectedStageId || '')

  const [currentMode, setCurrentMode] = React.useState(() =>
    stage?.stage?.spec?.infrastructure?.useFromStage ? Modes.Propagate : Modes.NewConfiguration
  )

  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { stages } = getFlattenedStages(pipeline)
  const { stage: propagatedStage = {} } = getStageFromPipeline(stage?.stage?.spec?.infrastructure?.useFromStage || '')

  const otherBuildStagesWithInfraConfigurationOptions: { label: string; value: string }[] = []

  if (stages && stages.length > 0) {
    stages.forEach((item, index) => {
      if (index < stageIndex && item.stage.type === 'CI' && item.stage.spec.infrastructure?.spec) {
        otherBuildStagesWithInfraConfigurationOptions.push({
          label: `Stage ${item.stage.name}`,
          value: item.stage.identifier
        })
      }
    })
  }

  const connectorId = getIdentifierFromValue((stage?.stage?.spec?.infrastructure?.spec?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((stage?.stage?.spec?.infrastructure?.spec?.connectorRef as string) || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  const getInitialValues = useMemo((): Values => {
    if (stage?.stage?.spec?.infrastructure) {
      if (stage?.stage?.spec?.infrastructure?.useFromStage) {
        return {
          useFromStage: stage?.stage?.spec?.infrastructure?.useFromStage
        }
      } else if (connector?.data?.connector) {
        const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
        return {
          connectorRef: {
            label: connector?.data?.connector.name || '',
            value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
            scope: scope,
            live: connector?.data?.status?.status === 'SUCCESS',
            connector: connector?.data?.connector
          },
          namespace: stage?.stage?.spec?.infrastructure?.spec?.namespace,
          annotations: getInitialMapValues(stage?.stage?.spec?.infrastructure?.spec?.annotations),
          labels: getInitialMapValues(stage?.stage?.spec?.infrastructure?.spec?.labels)
        }
      } else {
        return {
          connectorRef: '',
          namespace: stage?.stage?.spec?.infrastructure?.spec?.namespace,
          annotations: getInitialMapValues(stage?.stage?.spec?.infrastructure?.spec?.annotations),
          labels: getInitialMapValues(stage?.stage?.spec?.infrastructure?.spec?.labels)
        }
      }
    } else {
      return {
        connectorRef: '',
        namespace: '',
        annotations: '',
        labels: ''
      }
    }
  }, [connector, stage])

  React.useEffect(() => {
    if (!isEmpty(stage?.stage?.spec?.infrastructure?.spec?.connectorRef)) {
      refetch()
    }
  }, [stage?.stage?.spec?.infrastructure?.spec?.connectorRef])

  const handleValidate = (values: any): void => {
    if (stage) {
      if (currentMode === Modes.Propagate && values.useFromStage) {
        stage.stage.spec.infrastructure = {
          useFromStage: values.useFromStage
        }
      } else {
        const filteredLabels = getMapValues(
          Array.isArray(values.labels) ? values.labels.filter((val: any) => testLabelKey(val.key)) : values.labels
        )
        stage.stage.spec.infrastructure = {
          type: 'KubernetesDirect',
          spec: {
            connectorRef: values.connectorRef.value,
            namespace: values.namespace,
            annotations: getMapValues(values.annotations),
            labels: !isEmpty(filteredLabels) ? filteredLabels : undefined
          }
        }
        if (
          !values.annotations ||
          !values.annotations.length ||
          (values.annotations.length === 1 && !values.annotations[0].key)
        ) {
          delete stage.stage.spec.infrastructure.spec.annotations
        }
      }

      updatePipeline(pipeline)

      return values.labels.reduce((acc: Record<string, string>, curr: any, index: number) => {
        if (!testLabelKey(curr.key)) {
          acc[`labels[${index}].key`] = curr.key + ' is not allowed.'
        }
        return acc
      }, {})
    }
  }

  return (
    <div className={css.wrapper}>
      <div className={css.contentSection} ref={scrollRef}>
        <Formik
          enableReinitialize
          initialValues={getInitialValues}
          validationSchema={validationSchema}
          validate={handleValidate}
          formName="ciBuildInfra"
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {({ values: formValues, setFieldValue }) => (
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
                        {propagatedStage?.stage?.spec?.infrastructure?.spec?.connectorRef && (
                          <>
                            <Text font="small" margin={{ top: 'large', bottom: 'xsmall' }}>
                              {getString('connectors.title.k8sCluster')}
                            </Text>
                            <Text font="normal" color="black" margin={{ bottom: 'medium' }}>
                              {propagatedStage?.stage?.spec?.infrastructure?.spec?.connectorRef}
                            </Text>
                          </>
                        )}
                        {propagatedStage?.stage?.spec?.infrastructure?.spec?.namespace && (
                          <>
                            <Text font="small" margin={{ bottom: 'xsmall' }}>
                              {getString('pipelineSteps.build.infraSpecifications.namespace')}
                            </Text>
                            <Text font="normal" color="black" margin={{ bottom: 'medium' }}>
                              {propagatedStage?.stage?.spec?.infrastructure?.spec?.namespace}
                            </Text>
                          </>
                        )}
                        {propagatedStage?.stage?.spec?.infrastructure?.spec?.annotations && (
                          <>
                            <Text font="small" margin={{ bottom: 'xsmall' }}>
                              {getString('ci.annotations')}
                            </Text>
                            {typeof propagatedStage?.stage?.spec?.infrastructure?.spec?.annotations === 'string' ? (
                              <Text font="normal" color="black">
                                {propagatedStage.stage.spec.infrastructure.spec.annotations}
                              </Text>
                            ) : (
                              <ul className={css.plainList}>
                                {Object.entries(propagatedStage.stage.spec.infrastructure.spec.annotations).map(
                                  (entry, idx) => (
                                    <li key={idx}>
                                      <Text font="normal" color="black">
                                        {entry[0]}:{entry[1]}
                                      </Text>
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                          </>
                        )}
                        {propagatedStage?.stage?.spec?.infrastructure?.spec?.labels && (
                          <>
                            <Text font="small" margin={{ bottom: 'xsmall' }}>
                              {getString('ci.labels')}
                            </Text>
                            {typeof propagatedStage?.stage?.spec?.infrastructure?.spec?.labels === 'string' ? (
                              <Text font="normal" color="black">
                                {propagatedStage.stage.spec.infrastructure.spec.labels}
                              </Text>
                            ) : (
                              <ul className={css.plainList}>
                                {Object.entries(propagatedStage.stage.spec.infrastructure.spec.labels).map(
                                  (entry, idx) => (
                                    <li key={idx}>
                                      <Text font="normal" color="black">
                                        {entry[0]}:{entry[1]}
                                      </Text>
                                    </li>
                                  )
                                )}
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
                            stage.stage.spec.infrastructure = {
                              type: 'KubernetesDirect',
                              spec: {
                                connectorRef: '',
                                namespace: '',
                                annotations: {},
                                labels: {}
                              }
                            }

                            setFieldValue('useFromStage', undefined)

                            updatePipeline(pipeline)
                          }
                        }}
                      >
                        <Text className={css.cardTitle} font="normal" color="black" margin={{ bottom: 'large' }}>
                          {getString('pipelineSteps.build.infraSpecifications.newConfiguration')}
                        </Text>
                        <Text font="small" margin={{ bottom: 'xsmall' }}>
                          {getString('pipelineSteps.build.infraSpecifications.newConfigurationConnectorLabel')}
                        </Text>
                        <ConnectorReferenceField
                          width={300}
                          name="connectorRef"
                          selected={formValues.connectorRef as ConnectorReferenceFieldProps['selected']}
                          label={''}
                          placeholder={loading ? getString('loading') : getString('select')}
                          disabled={loading || isReadonly}
                          accountIdentifier={accountId}
                          projectIdentifier={projectIdentifier}
                          orgIdentifier={orgIdentifier}
                          onChange={(value, scope) => {
                            setFieldValue('connectorRef', {
                              label: value.name || '',
                              value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                              scope: scope
                            })
                          }}
                        />
                        <Text font="small" margin={{ bottom: 'xsmall' }}>
                          {getString('pipelineSteps.build.infraSpecifications.namespace')}
                        </Text>
                        <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                          <FormInput.MultiTextInput
                            label=""
                            name={'namespace'}
                            style={{ width: 300 }}
                            multiTextInputProps={{ disabled: isReadonly }}
                          />
                        </div>
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
                      <ConnectorReferenceField
                        width={300}
                        name="connectorRef"
                        selected={formValues.connectorRef as ConnectorReferenceFieldProps['selected']}
                        label={getString('pipelineSteps.build.infraSpecifications.newConfigurationConnectorLabel')}
                        placeholder={loading ? getString('loading') : getString('select')}
                        disabled={loading || isReadonly}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        onChange={(value, scope) => {
                          setFieldValue('connectorRef', {
                            label: value.name || '',
                            value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                            scope: scope
                          })
                        }}
                      />
                      <Text margin={{ bottom: 'xsmall' }}>
                        {getString('pipelineSteps.build.infraSpecifications.namespace')}
                      </Text>
                      <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                        <MultiTypeTextField
                          label=""
                          name={'namespace'}
                          style={{ width: 300 }}
                          multiTextInputProps={{
                            multiTextInputProps: { expressions },
                            disabled: isReadonly
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
          )}
        </Formik>
        <div className={css.navigationButtons}>{children}</div>
      </div>
    </div>
  )
}
