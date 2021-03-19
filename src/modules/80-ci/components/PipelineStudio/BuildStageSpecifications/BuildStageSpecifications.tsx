import React, { useEffect } from 'react'
import * as yup from 'yup'
import {
  Layout,
  Button,
  Formik,
  FormikForm,
  FormInput,
  MultiTextInput,
  Switch,
  Icon,
  Text,
  Popover,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Card,
  Accordion
} from '@wings-software/uicore'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { Dialog, Classes, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { FieldArray } from 'formik'
import { isEqual, debounce, cloneDeep } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/exports'
import { SecretDTOV2, listSecretsV2Promise } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import { loggerFor, ModuleName } from 'framework/exports'
import Timeline from '@common/components/Timeline/Timeline'
import SecretReference from '@secrets/components/SecretReference/SecretReference'
import { PipelineContext } from '@pipeline/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { skipConditionsNgDocsLink } from '@pipeline/components/PipelineSteps/AdvancedSteps/SkipConditionsPanel/SkipConditionsPanel'
import css from './BuildStageSpecifications.module.scss'

const logger = loggerFor(ModuleName.CD)

const validationSchema = yup.object().shape({
  name: yup.string().trim().required()
})

export interface Variable {
  name: string
  type: string
  value?: string
}

enum VariableTypes {
  // eslint-disable-next-line no-shadow
  String = 'String',
  Secret = 'Secret'
}

const secretsOptions: Map<string, string> = new Map()

export const getSecretKey = (secret: SecretDTOV2): string =>
  `${secret.orgIdentifier ? Scope.ORG : secret.projectIdentifier ? Scope.PROJECT : Scope.ACCOUNT}.${
    secret.identifier
  }` || ''

const TimelineNodes = [
  {
    label: 'Stage Details',
    id: 'stageDetails'
  },
  {
    label: 'Shared Paths',
    id: 'sharedPaths'
  },
  {
    label: 'Variables',
    id: 'variables-panel'
  },
  {
    label: 'Skip Conditions',
    id: 'skipConditions-panel'
  }
]

export default function BuildStageSpecifications({ children }: React.PropsWithChildren<unknown>): JSX.Element {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isDescriptionVisible, setDescriptionVisible] = React.useState(false)
  const [selectedVariable, setSelectedVariable] = React.useState<Variable>({
    name: '',
    type: VariableTypes.String,
    value: ''
  })

  const [secrets, setSecrets] = React.useState<SecretDTOV2[]>()
  const [lastFetchedSecrets, setLastFetchedSecrets] = React.useState<number>(0)

  const { getString } = useStrings()

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

  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  // const codebase = (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase

  // const [connectionType, setConnectionType] = React.useState(codebase?.repoName ? 'Account' : '')
  // const [connectorUrl, setConnectorUrl] = React.useState('')

  const { stage = {} } = getStageFromPipeline(selectedStageId || '')

  // const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  // const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')

  // const { data: connector, loading, refetch } = useGetConnector({
  //   identifier: connectorId,
  //   queryParams: {
  //     accountIdentifier: accountId,
  //     orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
  //     projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
  //   },
  //   lazy: true,
  //   debounce: 300
  // })

  // React.useEffect(() => {
  //   if (!isEmpty(codebase?.connectorRef)) {
  //     refetch()
  //   }
  // }, [codebase?.connectorRef])

  const onTimelineItemClick = (id: string) => {
    const element = document.querySelector(`#${id}`)
    if (scrollRef.current && element) {
      const elementTop = element.getBoundingClientRect().top
      const parentTop = scrollRef.current.getBoundingClientRect().top
      scrollRef.current.scrollTo({ top: elementTop - parentTop, behavior: 'smooth' })
    }
  }

  const getInitialValues = (): {
    identifier: string
    name: string
    description: string
    cloneCodebase: boolean
    sharedPaths: string[]
    variables: { name: string; type: string; value?: string }[]
    skipCondition: string
    // connectorRef?: ConnectorReferenceFieldProps['selected']
    // repoName?: string
  } => {
    const pipelineData = stage?.stage || null
    const spec = stage?.stage?.spec || null

    const identifier = pipelineData?.identifier || ''
    const name = pipelineData?.name || ''
    const description = pipelineData?.description || ''
    const cloneCodebase = spec?.cloneCodebase
    const sharedPaths =
      typeof spec?.sharedPaths === 'string'
        ? spec?.sharedPaths
        : spec?.sharedPaths?.map((_value: string) => ({
            id: uuid('', nameSpace()),
            value: _value
          })) || []
    const variables = pipelineData?.variables || []
    const skipCondition = pipelineData?.skipCondition || ''
    // let connectorRef
    // const repoName = codebase?.repoName || ''

    // if (connector?.data?.connector) {
    //   const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    //   connectorRef = {
    //     label: connector?.data?.connector.name || '',
    //     value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
    //     scope: scope,
    //     live: connector?.data?.status?.status === 'SUCCESS',
    //     connector: connector?.data?.connector
    //   }
    // }

    // Adding a default value
    if (Array.isArray(sharedPaths) && sharedPaths.length === 0) {
      sharedPaths.push({ id: uuid('', nameSpace()), value: '' })
    }

    return {
      identifier,
      name,
      description,
      cloneCodebase,
      sharedPaths,
      variables,
      skipCondition
      // connectorRef,
      // repoName
    }
  }

  const handleValidate = (values: any): void => {
    if (stage?.stage) {
      const prevStageData = cloneDeep(stage.stage)
      const stageData = stage.stage
      const spec = stage.stage.spec

      stageData.identifier = values.identifier
      stageData.name = values.name

      if (values.description) {
        stageData.description = values.description
      } else {
        delete stageData.description
      }

      spec.cloneCodebase = values.cloneCodebase

      if (values.sharedPaths && values.sharedPaths.length > 0) {
        spec.sharedPaths =
          typeof values.sharedPaths === 'string'
            ? values.sharedPaths
            : values.sharedPaths.map((listValue: { id: string; value: string }) => listValue.value)
      } else {
        delete spec.sharedPaths
      }

      if (values.variables && values.variables.length > 0) {
        stageData.variables = values.variables
      } else {
        delete stageData.variables
      }

      if (values.skipCondition) {
        stageData.skipCondition = values.skipCondition
      } else {
        delete stageData.skipCondition
      }

      // if (values.connectorRef) {
      //   if (values.cloneCodebase && values.connectorRef) {
      //     set(pipeline, 'properties.ci.codebase', {
      //       connectorRef: values.connectorRef.value,
      //       ...(values.repoName && { repoName: values.repoName }),
      //       build: RUNTIME_INPUT_VALUE
      //     })

      //     // Repo level connectors should not have repoName
      //     if (connectionType === 'Repo' && (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName) {
      //       delete (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName
      //     }

      //     updatePipeline(pipeline)
      //   }
      // } else {
      //   delete spec.connectorRef
      // }

      if (!isEqual(prevStageData, stageData)) {
        updatePipeline(pipeline)
      }
    }
  }

  const debounceHandleValidate = React.useRef(
    debounce((values: any) => {
      return handleValidate(values)
    }, 500)
  ).current

  // Cleanup debounce
  useEffect(() => {
    return () => {
      debounceHandleValidate.flush()
    }
  }, [])

  const openDialog = (): void => setIsDialogOpen(true)

  const closeDialog = React.useCallback(() => {
    setSelectedVariable({
      name: '',
      type: VariableTypes.String,
      value: ''
    })
    setIsDialogOpen(false)
  }, [setIsDialogOpen])

  // React.useEffect(() => {
  //   if (connector?.data?.connector && !connectionType && !connectorUrl) {
  //     setConnectionType(connector?.data?.connector.spec.type)
  //     setConnectorUrl(connector?.data?.connector.spec.url)
  //   }
  // }, [connector?.data?.connector])

  React.useEffect(() => {
    const fetchSecrets = async (): Promise<void> => {
      // Fetch only if the data is older then 60 Seconds
      if (lastFetchedSecrets + 60000 < new Date().getTime()) {
        setLastFetchedSecrets(new Date().getTime())
        const listOfSecrets = await listSecretsV2Promise({
          queryParams: { accountIdentifier: accountId }
        }).then(response => response?.data?.content?.map(secretResponse => secretResponse.secret))
        setSecrets(listOfSecrets)
      }
    }
    fetchSecrets()
  })

  const { expressions } = useVariablesExpression()

  secrets?.forEach(secret => {
    const key = getSecretKey(secret)
    if (key) {
      secretsOptions.set(key, secret.name || '')
    }
  })

  return (
    <div className={css.wrapper}>
      <Timeline onNodeClick={onTimelineItemClick} nodes={TimelineNodes} />

      <div className={css.contentSection} ref={scrollRef}>
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          validate={debounceHandleValidate}
          onSubmit={values => logger.info(JSON.stringify(values))}
        >
          {({ values: formValues, setFieldValue }) => (
            <>
              <div className={css.tabHeading} id="stageDetails">
                {getString('stageDetails')}
              </div>
              <Card className={cx(css.sectionCard, css.shadow)}>
                <FormikForm>
                  <Layout.Horizontal spacing="medium">
                    <FormInput.InputWithIdentifier
                      inputName="name"
                      inputLabel={getString('stageNameLabel')}
                      inputGroupProps={{
                        className: css.fields,
                        placeholder: getString('pipelineSteps.build.stageSpecifications.stageNamePlaceholder')
                      }}
                      isIdentifierEditable={false}
                    />
                    <div className={css.addDataLinks}>
                      {!isDescriptionVisible && !formValues.description && (
                        <Button
                          minimal
                          text={getString('pipelineSteps.build.stageSpecifications.addDescription')}
                          icon="plus"
                          onClick={() => setDescriptionVisible(true)}
                        />
                      )}
                    </div>
                  </Layout.Horizontal>

                  {(isDescriptionVisible || formValues.description) && (
                    <div className={css.fields}>
                      <span
                        onClick={() => {
                          setDescriptionVisible(false)
                          setFieldValue('description', '')
                        }}
                        className={css.removeLink}
                      >
                        {getString('removeLabel')}
                      </span>
                      <FormInput.TextArea name={'description'} label={getString('description')} />
                    </div>
                  )}

                  <Switch
                    checked={formValues.cloneCodebase}
                    label={getString('cloneCodebaseLabel')}
                    onChange={e => setFieldValue('cloneCodebase', e.currentTarget.checked)}
                  />
                  {/* {formValues.cloneCodebase && (
                      <div className={cx(css.configureCodebase, css.fields)}>
                        <Text
                          font={{ size: 'medium', weight: 'semi-bold' }}
                          icon="cog"
                          iconProps={{ size: 18 }}
                          margin={{ bottom: 'medium' }}
                        >
                          {getString('pipelineSteps.build.create.configureCodebase')}
                        </Text>
                        <Text margin={{ bottom: 'medium' }}>
                          {getString('pipelineSteps.build.create.configureCodebaseHelperText')}
                        </Text>
                        <ConnectorReferenceField
                          error={submitCount && errors.connectorRef ? errors.connectorRef : undefined}
                          name="connectorRef"
                                              type={['Github', 'Gitlab', 'Bitbucket']}
                          selected={formValues.connectorRef}
                          label={getString('connector')}
                          placeholder={loading ? getString('loading') : getString('select')}
                          disabled={loading}
                          width={300}
                          accountIdentifier={accountId}
                          projectIdentifier={projectIdentifier}
                          orgIdentifier={orgIdentifier}
                          onChange={(value, scope) => {
                            setConnectionType(value.spec.type)
                            setConnectorUrl(value.spec.url)

                            setFieldValue('connectorRef', {
                              label: value.name || '',
                              value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                              scope: scope
                            })
                          }}
                        />
                        {connectionType === 'Repo' ? (
                          <>
                            <Text margin={{ bottom: 'xsmall' }}>
                              {getString('pipelineSteps.build.create.repositoryNameLabel')}
                            </Text>
                            <TextInput name="repoName" value={connectorUrl} style={{ flexGrow: 1 }} disabled />
                          </>
                        ) : (
                          <>
                            <FormInput.Text
                              className={css.repositoryUrl}
                              label={'Repository Name'}
                              name="repoName"
                              style={{ flexGrow: 1 }}
                              disabled={loading}
                            />
                            {connectorUrl.length > 0 ? (
                              <div className={css.predefinedValue}>
                                {(connectorUrl[connectorUrl.length - 1] === '/' ? connectorUrl : connectorUrl + '/') +
                                  (formValues.repoName ? formValues.repoName : '')}
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    )} */}
                </FormikForm>
              </Card>

              <div className={css.tabHeading} id="sharedPaths">
                {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
              </div>
              <Card className={cx(css.sectionCard, css.shadow)}>
                <FormikForm className={css.fields}>
                  <MultiTypeList
                    name="sharedPaths"
                    multiTextInputProps={{ expressions }}
                    multiTypeFieldSelectorProps={{
                      label: (
                        <Text style={{ display: 'flex', alignItems: 'center' }}>
                          {getString('pipelineSteps.build.stageSpecifications.sharedPaths')}
                          <Button
                            icon="question"
                            minimal
                            tooltip={getString('pipelineSteps.build.stageSpecifications.sharedPathsInfo')}
                            iconProps={{ size: 14 }}
                          />
                        </Text>
                      )
                    }}
                  />
                </FormikForm>
              </Card>

              <Accordion className={css.sectionCard} activeId="variables">
                <Accordion.Panel
                  id="variables"
                  addDomId={true}
                  summary={getString('variablesText')}
                  details={
                    <FormikForm>
                      <FieldArray
                        name="variables"
                        render={({ push, remove }) => (
                          <>
                            {formValues.variables.length > 0 && (
                              <>
                                <div className={css.variablesGrid}>
                                  <Text className={css.variableTitle} font={{ size: 'small', weight: 'semi-bold' }}>
                                    {getString('pipelineSteps.build.stageSpecifications.variablesCell')}
                                    <Icon name="pipeline-variables" margin={{ left: 'small' }} />
                                  </Text>
                                  <Text className={css.variableTitle} font={{ size: 'small', weight: 'semi-bold' }}>
                                    {getString('pipelineSteps.build.stageSpecifications.valueCell')}
                                  </Text>
                                </div>
                                <div className={css.box}>
                                  {formValues.variables.map(({ name, type, value }, index) => (
                                    <div className={cx(css.variablesGrid, css.row)} key={name}>
                                      <Text color="black">{name}</Text>

                                      <div>
                                        {type === VariableTypes.Secret && (
                                          <div className={css.secretContainer}>
                                            {getMultiTypeFromValue(value) === MultiTypeInputType.FIXED && (
                                              <div className={css.fixed}>
                                                <Popover position={Position.BOTTOM}>
                                                  <div className={css.icon}>
                                                    <Icon name="key-main" size={24} height={12} width={24} />{' '}
                                                    <Icon name="chevron-down" size={14} />
                                                  </div>
                                                  <SecretReference
                                                    type="SecretText"
                                                    accountIdentifier={accountId}
                                                    projectIdentifier={projectIdentifier}
                                                    orgIdentifier={orgIdentifier}
                                                    onSelect={secret => {
                                                      setFieldValue(`variables[${index}].value`, getSecretKey(secret))
                                                    }}
                                                  />
                                                </Popover>
                                              </div>
                                            )}
                                            <MultiTextInput
                                              value={secretsOptions.get(value as string) || value}
                                              name={`variables[${index}].value`}
                                              textProps={{
                                                disabled: true
                                              }}
                                              onChange={newValue => {
                                                setFieldValue(`variables[${index}].value`, newValue)
                                              }}
                                              expressions={expressions}
                                            />
                                          </div>
                                        )}

                                        {type !== VariableTypes.Secret && (
                                          <>
                                            <FormInput.MultiTextInput
                                              label=""
                                              name={`variables[${index}].value`}
                                              style={{ flexGrow: 1 }}
                                              multiTextInputProps={{ expressions }}
                                            />
                                          </>
                                        )}

                                        {getMultiTypeFromValue(formValues.variables[index].value) ===
                                          MultiTypeInputType.RUNTIME && (
                                          <ConfigureOptions
                                            value={formValues.variables[index].value as string}
                                            type={
                                              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                                                <Text>{name}</Text>
                                              </Layout.Horizontal>
                                            }
                                            variableName={`variables[${index}].value`}
                                            showRequiredField={false}
                                            showDefaultField={false}
                                            showAdvanced={true}
                                            onChange={newValue => setFieldValue(`variables[${index}].value`, newValue)}
                                          />
                                        )}

                                        <Button
                                          className={css.editVariable}
                                          icon="Edit"
                                          minimal
                                          onClick={() => {
                                            setSelectedVariable({ name, type, value })
                                            openDialog()
                                          }}
                                        />
                                        <Button icon="trash" minimal onClick={() => remove(index)} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                            <Button
                              intent="primary"
                              minimal
                              text={getString('common.addVariable')}
                              onClick={() => openDialog()}
                            />
                            {isDialogOpen && (
                              <Dialog isOpen={true} title={getString('common.addVariable')} onClose={closeDialog}>
                                <Formik
                                  initialValues={selectedVariable}
                                  validationSchema={yup.object().shape({
                                    name: yup.string().trim().required(),
                                    type: yup.string().trim().required()
                                  })}
                                  onSubmit={(values: { name: string; type: string }): void => {
                                    const index = formValues.variables.findIndex(variable =>
                                      isEqual(selectedVariable, variable)
                                    )

                                    if (index === -1) {
                                      push({
                                        name: values.name,
                                        type: values.type,
                                        value: ''
                                      })
                                    } else {
                                      setFieldValue(`variables[${index}]`, {
                                        name: values.name,
                                        type: values.type,
                                        value: formValues.variables[index].value
                                      })
                                    }

                                    closeDialog()
                                  }}
                                >
                                  {({ submitForm }) => (
                                    <>
                                      <div className={Classes.DIALOG_BODY}>
                                        <FormikForm>
                                          <FormInput.Text
                                            name="name"
                                            label={getString('variableNameLabel')}
                                            placeholder={getString('name')}
                                          />
                                          <FormInput.Select
                                            name="type"
                                            items={[
                                              {
                                                label: getString('string'),
                                                value: VariableTypes.String
                                              },
                                              {
                                                label: getString('secretType'),
                                                value: VariableTypes.Secret
                                              }
                                            ]}
                                            label={getString('typeLabel')}
                                            placeholder={getString('typeLabel')}
                                          />
                                        </FormikForm>
                                      </div>
                                      <div className={Classes.DIALOG_FOOTER}>
                                        <Button
                                          intent="primary"
                                          text={selectedVariable.name ? getString('save') : getString('add')}
                                          onClick={submitForm}
                                        />{' '}
                                        &nbsp; &nbsp;
                                        <Button text={getString('cancel')} onClick={closeDialog} />
                                      </div>
                                    </>
                                  )}
                                </Formik>
                              </Dialog>
                            )}
                          </>
                        )}
                      />
                    </FormikForm>
                  }
                />
              </Accordion>

              <Accordion className={css.sectionCard} activeId="skipConditions">
                <Accordion.Panel
                  id="skipConditions"
                  addDomId={true}
                  summary={getString('skipConditionsTitle')}
                  details={
                    <FormikForm style={{ width: 300 }}>
                      <FormInput.ExpressionInput
                        items={expressions}
                        name="skipCondition"
                        label={getString('skipConditionStageLabel')}
                      />
                      <Text font="small" style={{ whiteSpace: 'break-spaces' }}>
                        {getString('skipConditionText')}
                        <br />
                        <a href={skipConditionsNgDocsLink} target="_blank" rel="noreferrer">
                          {getString('learnMore')}
                        </a>
                      </Text>
                    </FormikForm>
                  }
                />
              </Accordion>
            </>
          )}
        </Formik>
        <div className={css.navigationButtons}>{children}</div>
      </div>
    </div>
  )
}
