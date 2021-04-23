import React, { useEffect, useRef } from 'react'
import { Classes, ITreeNode, Tooltip, Intent, Dialog } from '@blueprintjs/core'
import {
  Button,
  Checkbox,
  Formik,
  FormikForm,
  Layout,
  Popover,
  Text,
  NestedAccordionProvider,
  useNestedAccordion,
  Accordion,
  Icon,
  useModalHook
} from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import { parse, stringify } from 'yaml'
import { pick, merge, isEmpty, isEqual, debounce } from 'lodash-es'
import * as Yup from 'yup'
import type { FormikErrors } from 'formik'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { NgPipeline, ResponseJsonNode } from 'services/cd-ng'
import {
  useGetPipeline,
  usePostPipelineExecuteWithInputSetYaml,
  useGetTemplateFromPipeline,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  getInputSetForPipelinePromise,
  useCreateInputSetForPipeline,
  useGetYamlSchema
} from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import routes from '@common/RouteDefinitions'
import { PipelineInputSetForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { PageBody } from '@common/components/Page/PageBody'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import StagesTree, { stagesTreeNodeClasses } from '@pipeline/components/StagesTree/StagesTree'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { BasicInputSetForm, InputSetDTO } from '../InputSetForm/InputSetForm'
import { InputSetSelector, InputSetSelectorProps } from '../InputSetSelector/InputSetSelector'
import { clearRuntimeInput, validatePipeline, getErrorsList } from '../PipelineStudio/StepUtil'
import { getPipelineTree } from '../PipelineStudio/PipelineUtils'
import factory from '../PipelineSteps/PipelineStepFactory'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import { PreFlightCheckModal } from '../PreFlightCheckModal/PreFlightCheckModal'
import css from './RunPipelineModal.module.scss'

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */
const debouncedValidatePipeline = debounce(validatePipeline, 300)
export interface RunPipelineFormProps extends PipelineType<PipelinePathProps> {
  inputSetSelected?: InputSetSelectorProps['value']
  inputSetYAML?: string
  onClose?: () => void
  executionView?: boolean
  mockData?: ResponseJsonNode
}

enum SelectedView {
  VISUAL = 'VISUAL',
  YAML = 'YAML'
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `run-pipeline.yaml`,
  entityType: 'Pipelines',
  width: 620,
  height: 360,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

function RunPipelineFormBasic({
  pipelineIdentifier,
  accountId,
  orgIdentifier,
  projectIdentifier,
  onClose,
  inputSetSelected,
  inputSetYAML,
  module,
  executionView
}: RunPipelineFormProps): React.ReactElement {
  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [skipPreFlightCheck, setSkipPreFlightCheck] = React.useState<boolean>(false)
  const [notifyOnlyMe, setNotifyOnlyMe] = React.useState<boolean>(false)
  const [selectedInputSets, setSelectedInputSets] = React.useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [nodes, updateNodes] = React.useState<ITreeNode[]>([])
  const [selectedTreeNodeId, setSelectedTreeNodeId] = React.useState<string>('')
  const [lastYaml, setLastYaml] = React.useState({})
  const [formErrors, setFormErrors] = React.useState<{}>({})
  const [currentPipeline, setCurrentPipeline] = React.useState<{ pipeline?: NgPipeline } | undefined>(
    inputSetYAML ? parse(inputSetYAML) : undefined
  )
  const { showError, showSuccess, showWarning } = useToaster()
  const history = useHistory()
  const { getString } = useStrings()

  useEffect(() => {
    if (inputSetYAML) {
      setCurrentPipeline(parse(inputSetYAML))
    }
  }, [inputSetYAML])

  const { openNestedPath } = useNestedAccordion()
  const { data: template, loading: loadingTemplate } = useGetTemplateFromPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier }
  })
  const { data: pipelineResponse, loading: loadingPipeline } = useGetPipeline({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const { mutate: runPipeline, loading: runLoading } = usePostPipelineExecuteWithInputSetYaml({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
    identifier: pipelineIdentifier,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const yamlTemplate = React.useMemo(() => {
    return parse(template?.data?.inputSetTemplateYaml || '')?.pipeline
  }, [template?.data?.inputSetTemplateYaml])

  React.useEffect(() => {
    setCurrentPipeline(
      merge(parse(template?.data?.inputSetTemplateYaml || ''), currentPipeline || {}) as { pipeline: NgPipeline }
    )
  }, [template?.data?.inputSetTemplateYaml])

  React.useEffect(() => {
    setSelectedInputSets(inputSetSelected)
  }, [inputSetSelected])

  React.useEffect(() => {
    if (template?.data?.inputSetTemplateYaml) {
      if ((selectedInputSets && selectedInputSets.length > 1) || selectedInputSets?.[0]?.type === 'OVERLAY_INPUT_SET') {
        const fetchData = async (): Promise<void> => {
          try {
            const data = await mergeInputSet({
              inputSetReferences: selectedInputSets.map(item => item.value as string)
            })
            if (data?.data?.pipelineYaml) {
              setCurrentPipeline(parse(data.data.pipelineYaml) as { pipeline: NgPipeline })
            }
          } catch (e) {
            showError(e?.data?.message || e?.message)
          }
        }
        fetchData()
      } else if (selectedInputSets && selectedInputSets.length === 1) {
        const fetchData = async (): Promise<void> => {
          const data = await getInputSetForPipelinePromise({
            inputSetIdentifier: selectedInputSets[0].value as string,
            queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, pipelineIdentifier }
          })
          if (data?.data?.inputSetYaml) {
            if (selectedInputSets[0].type === 'INPUT_SET') {
              setCurrentPipeline(pick(parse(data.data.inputSetYaml)?.inputSet, 'pipeline') as { pipeline: NgPipeline })
            }
          }
        }
        fetchData()
      }
    }
  }, [
    template?.data?.inputSetTemplateYaml,
    selectedInputSets,
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier
  ])

  const { mutate: mergeInputSet, loading: loadingUpdate } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, pipelineIdentifier }
  })

  const { mutate: createInputSet, loading: createInputSetLoading } = useCreateInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { loading, data: pipelineSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Pipelines',
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        setCurrentPipeline(parse(yamlHandler?.getLatestYaml() || '') as { pipeline: NgPipeline })
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml]
  )
  React.useEffect(() => {
    try {
      if (yamlHandler) {
        const Interval = window.setInterval(() => {
          const parsedYaml = parse(yamlHandler.getLatestYaml() || '')

          if (!isEqual(lastYaml, parsedYaml)) {
            setCurrentPipeline(parsedYaml as { pipeline: NgPipeline })
            setLastYaml(parsedYaml)
          }
        }, POLL_INTERVAL)
        return () => {
          window.clearInterval(Interval)
        }
      }
    } catch (e) {
      // Ignore Error
    }
  }, [yamlHandler, lastYaml])
  const pipeline: NgPipeline | undefined = parse(pipelineResponse?.data?.yamlPipeline || '')?.pipeline
  const renderErrors = React.useCallback(() => {
    const errorList = getErrorsList(formErrors)
    const errorCount = errorList.length
    if (!errorCount) {
      return null
    }
    const errorString = `${errorCount} ${errorCount > 1 ? 'problems' : 'problem'} with Input Set`
    return (
      <div className={css.errorHeader}>
        <Accordion>
          <Accordion.Panel
            id="errors"
            summary={
              <span>
                <Icon name="warning-sign" intent={Intent.DANGER} />
                {errorString}
              </span>
            }
            details={
              <ul>
                {errorList.map((errorMessage, index) => (
                  <li key={index}>{errorMessage}</li>
                ))}
              </ul>
            }
          />
        </Accordion>
      </div>
    )
  }, [formErrors])

  const valuesPipelineRef = useRef<NgPipeline>()

  const [showPreflightCheckModal, hidePreflightCheckModal] = useModalHook(() => {
    return (
      <Dialog className={css.preFlightCheckModal} isOpen onClose={hidePreflightCheckModal} title={''}>
        <PreFlightCheckModal
          pipeline={valuesPipelineRef.current}
          module={module}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          pipelineIdentifier={pipelineIdentifier}
          onCloseButtonClick={hidePreflightCheckModal}
          onContinuePipelineClick={() => {
            hidePreflightCheckModal()
            handleRunPipeline(valuesPipelineRef.current, true)
          }}
        />
      </Dialog>
    )
  }, [])

  const [canEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE]
    },
    [accountId, orgIdentifier, projectIdentifier, pipelineIdentifier]
  )

  const handleRunPipeline = React.useCallback(
    async (valuesPipeline?: NgPipeline, forceSkipFlightCheck = false) => {
      valuesPipelineRef.current = valuesPipeline
      if (!skipPreFlightCheck && !forceSkipFlightCheck) {
        // Not skipping pre-flight check - open the new modal
        showPreflightCheckModal()
        return
      }

      try {
        const response = await runPipeline(
          !isEmpty(valuesPipelineRef.current) ? (stringify({ pipeline: valuesPipelineRef.current }) as any) : ''
        )
        const data = response.data
        if (response.status === 'SUCCESS') {
          if (response.data) {
            showSuccess(getString('runPipelineForm.pipelineRunSuccessFully'))
            history.push(
              routes.toExecutionPipelineView({
                orgIdentifier,
                pipelineIdentifier,
                projectIdentifier,
                executionIdentifier: data?.planExecution?.uuid || '',
                accountId,
                module
              })
            )
          }
        }
      } catch (error) {
        showWarning(error?.data?.message || getString('runPipelineForm.runPipelineFailed'))
      }
    },
    [
      runPipeline,
      showWarning,
      showSuccess,
      pipelineIdentifier,
      history,
      orgIdentifier,
      module,
      projectIdentifier,
      onClose,
      accountId
    ]
  )

  React.useEffect(() => {
    const parsedPipeline = parse(pipelineResponse?.data?.yamlPipeline || '')
    parsedPipeline &&
      updateNodes(
        getPipelineTree(parsedPipeline.pipeline, stagesTreeNodeClasses, getString, {
          hideNonRuntimeFields: true,
          template: parse(template?.data?.inputSetTemplateYaml || '')?.pipeline
        })
      )
  }, [pipelineResponse?.data?.yamlPipeline, template?.data?.inputSetTemplateYaml])

  if (loadingPipeline || loadingTemplate || createInputSetLoading || loadingUpdate || runLoading) {
    return <PageSpinner />
  }

  const handleSelectionChange = (id: string): void => {
    setSelectedTreeNodeId(id)
    openNestedPath(id)
    document.getElementById(`${id}-panel`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const child = (
    <>
      <Layout.Horizontal
        className={css.pipelineHeader}
        padding={{ top: 'xlarge', left: 'xlarge', right: 'xlarge' }}
        flex={{ distribution: 'space-between' }}
      >
        <Text font="medium">{getString('common.pipeline')}</Text>
        {!executionView && pipeline && currentPipeline && template?.data?.inputSetTemplateYaml && (
          <InputSetSelector
            pipelineIdentifier={pipelineIdentifier}
            onChange={setSelectedInputSets}
            value={selectedInputSets}
          />
        )}
      </Layout.Horizontal>

      <Formik
        initialValues={currentPipeline?.pipeline ? clearRuntimeInput(currentPipeline.pipeline) : {}}
        onSubmit={values => {
          handleRunPipeline(values as any)
        }}
        enableReinitialize
        validate={values => {
          let errors: FormikErrors<InputSetDTO> = {}

          setCurrentPipeline({ ...currentPipeline, pipeline: values as NgPipeline })
          if (values && yamlTemplate && pipeline) {
            errors = debouncedValidatePipeline(
              values as NgPipeline,
              parse(template?.data?.inputSetTemplateYaml || '').pipeline,
              pipeline,
              getString
            ) as any
          }
          setFormErrors(errors)
          return errors
        }}
      >
        {({ values, submitForm }) => {
          return (
            <>
              <Layout.Horizontal
                className={css.content}
                padding={{ bottom: 'xlarge', left: 'xlarge', right: 'xlarge' }}
              >
                {selectedView === SelectedView.VISUAL ? (
                  <div className={css.inputsetGrid}>
                    <div className={css.treeSidebar}>
                      <StagesTree
                        contents={nodes || {}}
                        selectedId={selectedTreeNodeId}
                        selectionChange={handleSelectionChange}
                      />
                    </div>
                    <div>
                      {renderErrors()}
                      <FormikForm>
                        {pipeline && currentPipeline && template?.data?.inputSetTemplateYaml ? (
                          <PipelineInputSetForm
                            originalPipeline={pipeline}
                            template={parse(template.data.inputSetTemplateYaml).pipeline}
                            readonly={executionView}
                            path=""
                          />
                        ) : (
                          <Layout.Horizontal padding="medium" margin="medium">
                            <Text>{getString('runPipelineForm.noRuntimeInput')}</Text>
                          </Layout.Horizontal>
                        )}
                      </FormikForm>
                    </div>
                  </div>
                ) : (
                  <div className={css.editor}>
                    {loading ? (
                      <PageSpinner />
                    ) : (
                      <YamlBuilderMemo
                        {...yamlBuilderReadOnlyModeProps}
                        existingJSON={{ pipeline: values }}
                        bind={setYamlHandler}
                        invocationMap={factory.getInvocationMap()}
                        schema={pipelineSchema?.data}
                        height="calc(100vh - 330px)"
                        width="calc(100vw - 300px)"
                        showSnippetSection={false}
                      />
                    )}
                  </div>
                )}
              </Layout.Horizontal>
              {executionView ? null : (
                <Layout.Horizontal className={css.footer} padding={{ top: 'medium', left: 'xlarge', right: 'xlarge' }}>
                  <Layout.Horizontal flex={{ distribution: 'space-between' }} style={{ width: '100%' }}>
                    <Layout.Horizontal spacing="xxxlarge" style={{ alignItems: 'center' }}>
                      <Button
                        intent="primary"
                        type="submit"
                        icon="run-pipeline"
                        text={getString('runPipeline')}
                        onClick={event => {
                          event.stopPropagation()
                          submitForm()
                        }}
                      />
                      <Checkbox
                        label={getString('pre-flight-check.skipCheckBtn')}
                        checked={skipPreFlightCheck}
                        onChange={e => setSkipPreFlightCheck(e.currentTarget.checked)}
                      />
                      <Tooltip position="top" content={getString('featureNA')}>
                        <Checkbox
                          disabled
                          label={getString('runPipelineForm.notifyOnlyMe')}
                          checked={notifyOnlyMe}
                          onChange={e => setNotifyOnlyMe(e.currentTarget.checked)}
                        />
                      </Tooltip>
                    </Layout.Horizontal>
                    <Layout.Horizontal spacing="xxxlarge" style={{ alignItems: 'center' }}>
                      {pipeline && currentPipeline && template?.data?.inputSetTemplateYaml && (
                        <Popover
                          content={
                            <Layout.Vertical
                              padding="medium"
                              spacing="medium"
                              className={Classes.POPOVER_DISMISS_OVERRIDE}
                            >
                              <Formik
                                onSubmit={input => {
                                  createInputSet(stringify({ inputSet: input }) as any)
                                    .then(response => {
                                      if (response.data?.errorResponse) {
                                        showError(getString('inputSets.inputSetSavedError'))
                                      } else {
                                        showSuccess(getString('inputSets.inputSetSaved'))
                                      }
                                    })
                                    .catch(e => {
                                      showError(e?.data?.message || e?.message)
                                    })
                                }}
                                validationSchema={Yup.object().shape({
                                  name: Yup.string().trim().required(getString('inputSets.nameIsRequired'))
                                })}
                                initialValues={{ pipeline: values, name: '', identifier: '' } as InputSetDTO}
                              >
                                {({ submitForm: submitFormIs, values: formikValues }) => {
                                  return (
                                    <>
                                      <BasicInputSetForm isEdit={false} values={formikValues} />

                                      <Layout.Horizontal
                                        flex={{ distribution: 'space-between' }}
                                        padding={{ top: 'medium' }}
                                      >
                                        <Button
                                          intent="primary"
                                          text={getString('save')}
                                          onClick={event => {
                                            event.stopPropagation()
                                            submitFormIs()
                                          }}
                                        />
                                        <Button className={Classes.POPOVER_DISMISS} text={getString('cancel')} />
                                      </Layout.Horizontal>
                                    </>
                                  )
                                }}
                              </Formik>
                            </Layout.Vertical>
                          }
                        >
                          <Button
                            minimal
                            intent="primary"
                            text={getString('inputSets.saveAsInputSet')}
                            disabled={!canEdit}
                          />
                        </Popover>
                      )}
                      <Button
                        text={getString('cancel')}
                        onClick={() => {
                          if (onClose) {
                            onClose()
                          } else {
                            history.goBack()
                          }
                        }}
                      />
                    </Layout.Horizontal>
                  </Layout.Horizontal>
                </Layout.Horizontal>
              )}
            </>
          )
        }}
      </Formik>
    </>
  )

  return executionView ? (
    <div className={css.runFormExecutionView}>{child}</div>
  ) : (
    <RunPipelineFormWrapper
      accountId={accountId}
      orgIdentifier={orgIdentifier}
      pipelineIdentifier={pipelineIdentifier}
      projectIdentifier={projectIdentifier}
      module={module}
      selectedView={selectedView}
      handleModeSwitch={handleModeSwitch}
      pipeline={pipeline}
    >
      {child}
    </RunPipelineFormWrapper>
  )
}

export interface RunPipelineFormWrapperProps extends PipelineType<PipelinePathProps> {
  children: React.ReactNode
  selectedView: SelectedView
  handleModeSwitch(mode: SelectedView): void
  pipeline?: NgPipeline
}

export function RunPipelineFormWrapper(props: RunPipelineFormWrapperProps): React.ReactElement {
  const {
    children,
    orgIdentifier,
    projectIdentifier,
    accountId,
    pipelineIdentifier,
    module,
    handleModeSwitch,
    selectedView,
    pipeline
  } = props

  const { selectedProject: project } = useAppStore()
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <PageHeader
        title={
          <>
            <Layout.Vertical spacing="xsmall">
              <Breadcrumbs
                links={[
                  {
                    url: routes.toCDProjectOverview({ orgIdentifier, projectIdentifier, accountId }),
                    label: project?.name as string
                  },
                  {
                    url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
                    label: getString('pipelines')
                  },
                  {
                    url: routes.toPipelineDetail({
                      orgIdentifier,
                      projectIdentifier,
                      accountId,
                      pipelineIdentifier,
                      module
                    }),
                    label: pipeline?.name || ''
                  },
                  { url: '#', label: getString('runPipeline') }
                ]}
              />
              <Layout.Horizontal>
                <Text font="medium">{`${getString('runPipeline')}: ${pipeline?.name}`}</Text>
                <div className={css.optionBtns}>
                  <div
                    className={cx(css.item, { [css.selected]: selectedView === SelectedView.VISUAL })}
                    onClick={() => handleModeSwitch(SelectedView.VISUAL)}
                  >
                    {getString('visual')}
                  </div>
                  <div
                    className={cx(css.item, { [css.selected]: selectedView === SelectedView.YAML })}
                    onClick={() => handleModeSwitch(SelectedView.YAML)}
                  >
                    {getString('yaml')}
                  </div>
                </div>
              </Layout.Horizontal>
            </Layout.Vertical>
          </>
        }
      />
      <PageBody className={css.runForm}>{children}</PageBody>
    </React.Fragment>
  )
}

export const RunPipelineForm: React.FC<RunPipelineFormProps> = props => {
  return (
    <NestedAccordionProvider>
      <RunPipelineFormBasic {...props} />
    </NestedAccordionProvider>
  )
}
