import React from 'react'
import * as yup from 'yup'
import {
  Layout,
  Formik,
  FormikForm,
  FormInput,
  Text,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Card
} from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { useStrings } from 'framework/exports'
import { Scope } from '@common/interfaces/SecretsInterface'
import { loggerFor, ModuleName } from 'framework/exports'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { PipelineContext, getStageIndexFromPipeline, getFlattenedStages } from '@pipeline/exports'
import Timeline from '@common/components/Timeline/Timeline'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
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
import css from './BuildInfraSpecifications.module.scss'

const logger = loggerFor(ModuleName.CD)

const validationSchema = yup.object().shape({
  connectorRef: yup.mixed().required(),
  namespace: yup.string().trim().required()
})

const TimelineNodes = [
  {
    label: 'Infrastructure Definition',
    id: 'infrastructureDefinition'
  }
]

interface Values {
  connectorRef?: ConnectorReferenceFieldProps['selected'] | string
  namespace?: string
  useFromStage?: string
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
      pipelineView: {
        splitViewData: { selectedStageId }
      }
    },
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

  const getInitialValues = (): Values => {
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
          namespace: stage?.stage?.spec?.infrastructure?.spec?.namespace
        }
      } else {
        return {
          connectorRef: '',
          namespace: stage?.stage?.spec?.infrastructure?.spec?.namespace
        }
      }
    } else {
      return {
        connectorRef: '',
        namespace: ''
      }
    }
  }

  React.useEffect(() => {
    if (!isEmpty(stage?.stage?.spec?.infrastructure?.spec?.connectorRef)) {
      refetch()
    }
  }, [stage?.stage?.spec?.infrastructure?.spec?.connectorRef])

  const onTimelineItemClick = (id: string) => {
    const element = document.querySelector(`#${id}`)
    if (scrollRef.current && element) {
      const elementTop = element.getBoundingClientRect().top
      const parentTop = scrollRef.current.getBoundingClientRect().top
      scrollRef.current.scrollTo({ top: elementTop - parentTop, behavior: 'smooth' })
    }
  }

  const handleValidate = (values: any): void => {
    if (stage) {
      if (currentMode === Modes.Propagate && values.useFromStage) {
        stage.stage.spec.infrastructure = {
          useFromStage: values.useFromStage
        }
      } else {
        stage.stage.spec.infrastructure = {
          type: 'KubernetesDirect',
          spec: {
            connectorRef: values.connectorRef.value,
            namespace: values.namespace
          }
        }
      }

      updatePipeline(pipeline)
    }
  }

  return (
    <div className={css.wrapper}>
      <Timeline onNodeClick={onTimelineItemClick} nodes={TimelineNodes} />

      <div className={css.contentSection} ref={scrollRef}>
        <Formik
          enableReinitialize
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          validate={handleValidate}
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {({ values: formValues, setFieldValue }) => (
            <Layout.Vertical>
              <div className={css.tabHeading} id="infrastructureDefinition">
                {getString('pipelineSteps.build.infraSpecifications.whereToRun')}
              </div>
              <FormikForm>
                {otherBuildStagesWithInfraConfigurationOptions.length ? (
                  <Card className={cx(css.sectionCard, css.shadow)}>
                    <Layout.Horizontal spacing="xxlarge">
                      <div
                        className={cx(css.card, { [css.active]: currentMode === Modes.Propagate })}
                        style={{ width: 410 }}
                        onClick={() => setCurrentMode(Modes.Propagate)}
                      >
                        <Text className={css.cardTitle} font="normal" color="black" margin={{ bottom: 'large' }}>
                          {getString('pipelineSteps.build.infraSpecifications.propagate')}
                        </Text>
                        <FormInput.Select name="useFromStage" items={otherBuildStagesWithInfraConfigurationOptions} />
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
                            <Text font="normal" color="black">
                              {propagatedStage?.stage?.spec?.infrastructure?.spec?.namespace}
                            </Text>
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
                                namespace: ''
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
                          disabled={loading}
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
                          <FormInput.MultiTextInput label="" name={'namespace'} style={{ width: 300 }} />
                          {getMultiTypeFromValue(formValues.namespace) === MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formValues.namespace as string}
                              type={
                                <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                                  <Text>{getString('pipelineSteps.build.infraSpecifications.namespace')}</Text>
                                </Layout.Horizontal>
                              }
                              variableName={'namespace'}
                              showRequiredField={false}
                              showDefaultField={false}
                              showAdvanced={true}
                              onChange={value => setFieldValue('namespace', value)}
                            />
                          )}
                        </div>
                      </div>
                    </Layout.Horizontal>
                  </Card>
                ) : (
                  <Card className={cx(css.sectionCard, css.shadow)}>
                    <ConnectorReferenceField
                      width={300}
                      name="connectorRef"
                      selected={formValues.connectorRef as ConnectorReferenceFieldProps['selected']}
                      label={getString('pipelineSteps.build.infraSpecifications.newConfigurationConnectorLabel')}
                      placeholder={loading ? getString('loading') : getString('select')}
                      disabled={loading}
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
                          multiTextInputProps: { expressions }
                        }}
                      />
                      {getMultiTypeFromValue(formValues.namespace) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={formValues.namespace as string}
                          type={
                            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                              <Text>{getString('pipelineSteps.build.infraSpecifications.namespace')}</Text>
                            </Layout.Horizontal>
                          }
                          variableName={'namespace'}
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => setFieldValue('namespace', value)}
                        />
                      )}
                    </div>
                  </Card>
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
