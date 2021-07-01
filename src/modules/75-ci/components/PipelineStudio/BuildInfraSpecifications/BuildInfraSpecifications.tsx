import React, { useMemo } from 'react'
import * as yup from 'yup'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { Layout, Formik, FormikForm, FormInput, Text, Card, Accordion, Button } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { produce } from 'immer'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { useStrings } from 'framework/strings'
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
  connectorRef?: string
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

  const connectorId = (stage?.stage?.spec?.infrastructure?.spec?.connectorRef as string) || ''

  const getInitialValues = useMemo((): Values => {
    if (stage?.stage?.spec?.infrastructure) {
      if (stage?.stage?.spec?.infrastructure?.useFromStage) {
        return {
          useFromStage: stage?.stage?.spec?.infrastructure?.useFromStage
        }
      } else if (!isEmpty(connectorId)) {
        return {
          connectorRef: stage?.stage?.spec?.infrastructure?.spec?.connectorRef,
          namespace: stage?.stage?.spec?.infrastructure?.spec?.namespace,
          annotations: getInitialMapValues(stage?.stage?.spec?.infrastructure?.spec?.annotations),
          labels: getInitialMapValues(stage?.stage?.spec?.infrastructure?.spec?.labels)
        }
      } else {
        return {
          connectorRef: undefined,
          namespace: stage?.stage?.spec?.infrastructure?.spec?.namespace,
          annotations: getInitialMapValues(stage?.stage?.spec?.infrastructure?.spec?.annotations),
          labels: getInitialMapValues(stage?.stage?.spec?.infrastructure?.spec?.labels)
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

  const handleValidate = (values: any): void => {
    if (stage) {
      const stageData = produce(stage, draft => {
        if (currentMode === Modes.Propagate && values.useFromStage) {
          draft.stage.spec.infrastructure = {
            useFromStage: values.useFromStage
          }
        } else {
          const filteredLabels = getMapValues(
            Array.isArray(values.labels) ? values.labels.filter((val: any) => testLabelKey(val.key)) : values.labels
          )
          draft.stage.spec.infrastructure = {
            type: 'KubernetesDirect',
            spec: {
              // Avoid accidental overrides for connectorRef
              connectorRef: values?.connectorRef?.value ?? draft.stage.spec.infrastructure?.spec?.connectorRef,
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
            delete draft.stage.spec.infrastructure.spec.annotations
          }
        }
      })

      updateStage(stageData.stage)

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
          initialValues={getInitialValues}
          validationSchema={validationSchema}
          validate={handleValidate}
          formName="ciBuildInfra"
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {({ setFieldValue }) => (
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
                            const newStageData = produce(stage, draft => {
                              draft.stage.spec.infrastructure = {
                                type: 'KubernetesDirect',
                                spec: {
                                  connectorRef: '',
                                  namespace: '',
                                  annotations: {},
                                  labels: {}
                                }
                              }
                            })
                            setFieldValue('useFromStage', undefined)
                            updateStage(newStageData.stage)
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
                          disabled={isReadonly}
                          accountIdentifier={accountId}
                          projectIdentifier={projectIdentifier}
                          orgIdentifier={orgIdentifier}
                          gitScope={gitScope}
                        />
                        <Text font="small" margin={{ bottom: 'xsmall' }}>
                          {getString('pipelineSteps.build.infraSpecifications.namespace')}
                          <Button
                            icon="question"
                            minimal
                            tooltip={getString('pipeline.namespaceTooltip')}
                            iconProps={{ size: 14 }}
                          />
                        </Text>
                        <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                          <FormInput.MultiTextInput
                            label=""
                            name={'namespace'}
                            placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
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
                      <FormMultiTypeConnectorField
                        width={300}
                        name="connectorRef"
                        label={getString('connectors.title.k8sCluster')}
                        placeholder={getString('pipelineSteps.build.infraSpecifications.kubernetesClusterPlaceholder')}
                        disabled={isReadonly}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        gitScope={gitScope}
                      />
                      <Text margin={{ bottom: 'xsmall' }}>
                        {getString('pipelineSteps.build.infraSpecifications.namespace')}
                        <Button
                          icon="question"
                          minimal
                          tooltip={getString('pipeline.namespaceTooltip')}
                          iconProps={{ size: 14 }}
                        />
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
