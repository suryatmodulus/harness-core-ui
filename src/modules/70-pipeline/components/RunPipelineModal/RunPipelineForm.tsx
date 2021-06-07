import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { MutateMethod } from 'restful-react'
import * as Yup from 'yup'
import { Tooltip, Intent, Dialog, Classes, RadioGroup, Radio, PopoverPosition } from '@blueprintjs/core'
import {
  Button,
  Checkbox,
  Formik,
  FormikForm,
  Layout,
  Text,
  NestedAccordionProvider,
  Icon,
  useModalHook,
  Utils,
  Heading,
  Color,
  Popover
} from '@wings-software/uicore'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { parse, stringify } from 'yaml'
import { pick, merge, isEmpty, isEqual } from 'lodash-es'
import type { FormikErrors } from 'formik'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { NameIdDescriptionTags } from '@common/components'
import type { NgPipeline, ResponseJsonNode } from 'services/cd-ng'
import {
  useGetPipeline,
  usePostPipelineExecuteWithInputSetYaml,
  useGetTemplateFromPipeline,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  getInputSetForPipelinePromise,
  useGetInputSetsListForPipeline,
  ResponseInputSetTemplateResponse,
  useCreateInputSetForPipeline,
  ResponseInputSetResponse,
  CreateInputSetForPipelineQueryParams
} from 'services/pipeline-ng'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { usePermission } from '@rbac/hooks/usePermission'
import { PipelineInputSetForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import type { GitQueryParams, InputSetGitQueryParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { PageBody } from '@common/components/Page/PageBody'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import type { InputSetDTO } from '../InputSetForm/InputSetForm'
import { InputSetSelector, InputSetSelectorProps } from '../InputSetSelector/InputSetSelector'
import { clearRuntimeInput, validatePipeline, getErrorsList } from '../PipelineStudio/StepUtil'
import { PreFlightCheckModal } from '../PreFlightCheckModal/PreFlightCheckModal'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import type { Values } from '../PipelineStudio/StepCommands/StepCommandTypes'
import factory from '../PipelineSteps/PipelineStepFactory'
import css from './RunPipelineModal.module.scss'

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */
export interface RunPipelineFormProps extends PipelineType<PipelinePathProps & GitQueryParams> {
  inputSetSelected?: InputSetSelectorProps['value']
  inputSetYAML?: string
  onClose?: () => void
  executionView?: boolean
  mockData?: ResponseJsonNode
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `run-pipeline.yaml`,
  entityType: 'Pipelines',
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

enum SelectedView {
  VISUAL = 'VISUAL',
  YAML = 'YAML'
}

interface ModeSelectorProps {
  selectedView: SelectedView
  handleModeSwitch: (view: SelectedView) => void
  template: ResponseInputSetTemplateResponse | null
}

const ModeSelector = ({ selectedView, handleModeSwitch, template }: ModeSelectorProps) => {
  const { getString } = useStrings()
  const noRuntimeInputs = !template?.data?.inputSetTemplateYaml
  return (
    <div className={css.optionBtns}>
      <div
        className={cx(css.item, { [css.selected]: selectedView === SelectedView.VISUAL })}
        onClick={() => handleModeSwitch(SelectedView.VISUAL)}
      >
        {getString('visual')}
      </div>
      <div
        className={cx(css.item, {
          [css.selected]: selectedView === SelectedView.YAML,
          [css.disabledMode]: noRuntimeInputs
        })}
        onClick={() => {
          if (noRuntimeInputs) {
            // No runtime inputs in the pipeline, do not allow the user to switch to YAML mode
            return
          }
          handleModeSwitch(SelectedView.YAML)
        }}
      >
        {getString('yaml')}
      </div>
    </div>
  )
}

interface SaveAsInputSetProps {
  pipeline?: NgPipeline
  currentPipeline?: { pipeline?: NgPipeline }
  template: ResponseInputSetTemplateResponse | null
  values: Values
  projectIdentifier: string
  orgIdentifier: string
  canEdit: boolean
  createInputSetLoading: boolean
  createInputSet: MutateMethod<ResponseInputSetResponse, void, CreateInputSetForPipelineQueryParams, void>
}

const SaveAsInputSet = ({
  pipeline,
  currentPipeline,
  template,
  orgIdentifier,
  projectIdentifier,
  values,
  canEdit,
  createInputSet,
  createInputSetLoading
}: SaveAsInputSetProps): JSX.Element | null => {
  const { getString } = useStrings()

  const { showError, showSuccess } = useToaster()
  const { GIT_SYNC_NG } = useFeatureFlags()
  if (pipeline && currentPipeline && template?.data?.inputSetTemplateYaml) {
    return (
      <Popover
        content={
          <div className={Classes.POPOVER_DISMISS_OVERRIDE}>
            <Formik
              onSubmit={input => {
                createInputSet(stringify({ inputSet: { ...input, orgIdentifier, projectIdentifier } }) as any)
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
              {createInputSetFormikProps => {
                const { submitForm: submitFormIs } = createInputSetFormikProps
                return (
                  <Layout.Vertical padding="large" width={400}>
                    <NameIdDescriptionTags
                      identifierProps={{
                        inputLabel: getString('inputSets.inputSetName'),
                        isIdentifierEditable: true,
                        inputGroupProps: {
                          disabled: !canEdit
                        }
                      }}
                      descriptionProps={{ disabled: !canEdit }}
                      tagsProps={{
                        disabled: !canEdit
                      }}
                      formikProps={createInputSetFormikProps}
                    />
                    <Layout.Horizontal spacing="medium">
                      <Button
                        intent="primary"
                        text={createInputSetLoading ? getString('loading') : getString('save')}
                        type="submit"
                        disabled={createInputSetLoading}
                        onClick={event => {
                          event.stopPropagation()
                          submitFormIs()
                        }}
                      />
                      <Button className={Classes.POPOVER_DISMISS} text={getString('cancel')} />
                    </Layout.Horizontal>
                  </Layout.Vertical>
                )
              }}
            </Formik>
          </div>
        }
      >
        <Button
          minimal
          intent="primary"
          text={getString('inputSets.saveAsInputSet')}
          disabled={!canEdit || GIT_SYNC_NG}
        />
      </Popover>
    )
  }
  return null
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
  executionView,
  branch,
  repoIdentifier,
  inputSetRepoIdentifier,
  inputSetBranch
}: RunPipelineFormProps & InputSetGitQueryParams): React.ReactElement {
  const [skipPreFlightCheck, setSkipPreFlightCheck] = React.useState<boolean>(false)
  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [notifyOnlyMe, setNotifyOnlyMe] = React.useState<boolean>(false)
  const [selectedInputSets, setSelectedInputSets] = React.useState<InputSetSelectorProps['value']>(inputSetSelected)
  const [formErrors, setFormErrors] = React.useState<FormikErrors<InputSetDTO>>({})
  const [currentPipeline, setCurrentPipeline] = React.useState<{ pipeline?: NgPipeline } | undefined>(
    inputSetYAML ? parse(inputSetYAML) : undefined
  )
  const [gitFilter, setGitFilter] = React.useState<GitFilterScope | null>({
    repo: inputSetRepoIdentifier || '',
    branch: inputSetBranch || '',
    getDefaultFromOtherRepo: true
  })
  const { showError, showSuccess, showWarning } = useToaster()
  const history = useHistory()
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()

  const { mutate: createInputSet, loading: createInputSetLoading } = useCreateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      ...(isGitSyncEnabled && {
        repoIdentifier,
        branch
      })
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

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

  useEffect(() => {
    if (inputSetYAML) {
      setExistingProvide('provide')
      setCurrentPipeline(parse(inputSetYAML))
    }
  }, [inputSetYAML])

  const { data: template, loading: loadingTemplate } = useGetTemplateFromPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })
  const { data: pipelineResponse, loading: loadingPipeline } = useGetPipeline({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })
  const { mutate: runPipeline, loading: runLoading } = usePostPipelineExecuteWithInputSetYaml({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch
    },
    identifier: pipelineIdentifier,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const { data: inputSetResponse, loading: inputSetLoading } = useGetInputSetsListForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      repoIdentifier,
      branch
    }
  })

  const inputSets = inputSetResponse?.data?.content

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
            queryParams: {
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              pipelineIdentifier,
              repoIdentifier: selectedInputSets[0]?.gitDetails?.repoIdentifier,
              branch: selectedInputSets[0]?.gitDetails?.branch
            }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    template?.data?.inputSetTemplateYaml,
    selectedInputSets,
    accountId,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier
  ])

  const { mutate: mergeInputSet, loading: loadingUpdate } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch,
      ...(gitFilter?.repo &&
        gitFilter.branch && {
          repoIdentifier: gitFilter.repo,
          branch: gitFilter.branch,
          getDefaultFromOtherRepo: true
        })
    }
  })

  const pipeline: NgPipeline | undefined = parse(pipelineResponse?.data?.yamlPipeline || '')?.pipeline
  const renderErrors = React.useCallback(() => {
    const { errorStrings, errorCount } = getErrorsList(formErrors)
    if (!errorCount) {
      return null
    }
    const errorString = `Errors: ${errorCount}`
    return (
      <Layout.Horizontal className={css.errorHeader}>
        <Icon name="warning-sign" intent={Intent.DANGER} margin={{ right: 'small' }} />
        <Text intent="danger">{errorString}</Text>
        <Utils.WrapOptionalTooltip
          tooltip={
            <div className={css.runPipelineErrorDesc}>
              {errorStrings.map((errorMessage, index) => (
                <Text intent="danger" key={index} font={{ weight: 'semi-bold' }} className={css.runPipelineErrorLine}>
                  {errorMessage}
                </Text>
              ))}
            </div>
          }
          tooltipProps={{
            position: PopoverPosition.BOTTOM,
            inheritDarkTheme: true,
            popoverClassName: css.runPipelineErrorPopover
          }}
        >
          <Text font={{ size: 'small' }} margin={{ left: 'small' }}>
            See details
          </Text>
        </Utils.WrapOptionalTooltip>
      </Layout.Horizontal>
    )
  }, [formErrors])

  const valuesPipelineRef = useRef<NgPipeline>()

  const [showPreflightCheckModal, hidePreflightCheckModal] = useModalHook(() => {
    return (
      <Dialog className={cx(css.preFlightCheckModal, Classes.DIALOG)} isOpen onClose={hidePreflightCheckModal}>
        <PreFlightCheckModal
          pipeline={valuesPipelineRef.current}
          module={module}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          pipelineIdentifier={pipelineIdentifier}
          branch={branch}
          repoIdentifier={repoIdentifier}
          onCloseButtonClick={hidePreflightCheckModal}
          onContinuePipelineClick={() => {
            hidePreflightCheckModal()
            handleRunPipeline(valuesPipelineRef.current, true)
          }}
        />
      </Dialog>
    )
  }, [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      accountId,
      skipPreFlightCheck
    ]
  )

  const [existingProvide, setExistingProvide] = React.useState('existing')

  useEffect(() => {
    if (inputSets && !(inputSets.length > 0)) {
      setExistingProvide('provide')
    }
  }, [inputSets])

  const mountRefForError = React.useRef<boolean>(false)

  useEffect(() => {
    if (mountRefForError.current && selectedInputSets) {
      mountRefForError.current = false
    }
  }, [selectedInputSets])

  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [lastYaml, setLastYaml] = useState({})

  const handleModeSwitch = useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const presentPipeline = parse(yamlHandler?.getLatestYaml() || '') as { pipeline: NgPipeline }
        const errors = validatePipeline(
          presentPipeline.pipeline,
          parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
          currentPipeline?.pipeline,
          getString
        ) as any
        setFormErrors(errors)
        setCurrentPipeline(presentPipeline)
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml]
  )

  useEffect(() => {
    try {
      if (yamlHandler) {
        const Interval = window.setInterval(() => {
          const parsedYaml = parse(yamlHandler.getLatestYaml() || '')

          if (!isEqual(lastYaml, parsedYaml)) {
            const errors = validatePipeline(
              parsedYaml.pipeline,
              parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
              currentPipeline?.pipeline,
              getString
            ) as any
            setFormErrors(errors)
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

  useEffect(() => {
    let errors: FormikErrors<InputSetDTO> = formErrors

    if (
      !mountRefForError.current &&
      currentPipeline?.pipeline &&
      template?.data?.inputSetTemplateYaml &&
      yamlTemplate &&
      pipeline
    ) {
      errors = validatePipeline(
        selectedInputSets && selectedInputSets.length > 0
          ? currentPipeline.pipeline
          : { ...clearRuntimeInput(currentPipeline.pipeline) },
        parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
        currentPipeline.pipeline,
        getString
      ) as any
      mountRefForError.current = true
      setFormErrors(errors)
    }
  }, [
    existingProvide,
    currentPipeline,
    getString,
    pipeline,
    template?.data?.inputSetTemplateYaml,
    yamlTemplate,
    selectedInputSets,
    existingProvide
  ])

  if (loadingPipeline || loadingTemplate || loadingUpdate || runLoading || inputSetLoading) {
    return <PageSpinner />
  }

  const child = (
    <>
      <Formik
        initialValues={
          pipeline && currentPipeline && template?.data?.inputSetTemplateYaml
            ? currentPipeline?.pipeline
              ? clearRuntimeInput(currentPipeline.pipeline)
              : {}
            : currentPipeline?.pipeline
            ? clearRuntimeInput(currentPipeline.pipeline)
            : {}
        }
        formName="runPipeline"
        onSubmit={values => {
          handleRunPipeline(values as any)
        }}
        enableReinitialize
        validate={async values => {
          let errors: FormikErrors<InputSetDTO> = formErrors

          setCurrentPipeline({ ...currentPipeline, pipeline: values as NgPipeline })

          function validateErrors() {
            const promise: Promise<FormikErrors<InputSetDTO>> = new Promise(resolve => {
              setTimeout(() => {
                const validatedErrors =
                  (validatePipeline(
                    values as NgPipeline,
                    parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
                    pipeline,
                    getString
                  ) as any) || formErrors
                resolve(validatedErrors)
              }, 300)
            })
            return promise
          }

          errors = await validateErrors()

          if (typeof errors !== undefined) setFormErrors(errors)
          return errors
        }}
      >
        {({ submitForm, values }) => {
          return (
            <Layout.Vertical>
              {executionView ? null : (
                <>
                  <div className={css.runModalHeader}>
                    <Heading
                      level={2}
                      font={{ weight: 'bold' }}
                      color={Color.BLACK_100}
                      className={css.runModalHeaderTitle}
                    >
                      {getString('runPipeline')}
                    </Heading>
                    <ModeSelector selectedView={selectedView} handleModeSwitch={handleModeSwitch} template={template} />
                  </div>
                  {renderErrors()}
                </>
              )}
              {selectedView === SelectedView.VISUAL ? (
                <div className={css.runModalFormContent}>
                  <FormikForm>
                    {pipeline && currentPipeline && template?.data?.inputSetTemplateYaml ? (
                      <>
                        {inputSets && inputSets.length > 0 && (
                          <>
                            {!executionView && (
                              <Layout.Vertical
                                className={css.pipelineHeader}
                                padding={{ top: 'xlarge', left: 'xlarge', right: 'xlarge' }}
                              >
                                <div>
                                  <Layout.Horizontal className={css.runModalSubHeading} id="use-input-set">
                                    <RadioGroup
                                      name="existingProvideRadio"
                                      label={getString(
                                        'pipeline.triggers.pipelineInputPanel.selectedExisitingOrProvide'
                                      )}
                                      inline
                                      selectedValue={existingProvide}
                                      onChange={ev => {
                                        setExistingProvide((ev.target as HTMLInputElement).value)
                                      }}
                                    >
                                      <Radio
                                        label={getString('pipeline.triggers.pipelineInputPanel.provide')}
                                        value="provide"
                                        className={cx(
                                          css.valueProviderRadio,
                                          existingProvide === 'provide' ? css.selectedValueProvider : ''
                                        )}
                                      />
                                      <Radio
                                        label={getString('pipeline.triggers.pipelineInputPanel.existing')}
                                        value="existing"
                                        className={cx(
                                          css.valueProviderRadio,
                                          existingProvide === 'existing' ? css.selectedValueProvider : ''
                                        )}
                                      />
                                    </RadioGroup>
                                    <span className={css.helpSection}>
                                      <Icon name="question" className={css.helpIcon} />
                                      <Text
                                        tooltipProps={{
                                          position: PopoverPosition.BOTTOM
                                        }}
                                        tooltip={
                                          <Text padding="medium" width={400}>
                                            Harness Input Sets are collections of variables/values that can be provided
                                            to one or more Pipelines before execution.
                                            <a
                                              href="https://ngdocs.harness.io/article/3fqwa8et3d-input-sets"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              Learn more
                                            </a>
                                          </Text>
                                        }
                                      >
                                        {getString('pipeline.triggers.pipelineInputPanel.whatAreInputsets')}
                                      </Text>
                                    </span>
                                  </Layout.Horizontal>
                                  {isGitSyncEnabled && (
                                    <Layout.Horizontal padding={{ bottom: 'small' }}>
                                      <GitSyncStoreProvider>
                                        <GitFilters
                                          onChange={filter => {
                                            setGitFilter(filter)
                                          }}
                                          defaultValue={gitFilter || undefined}
                                        />
                                      </GitSyncStoreProvider>
                                    </Layout.Horizontal>
                                  )}
                                </div>
                                {!executionView &&
                                  pipeline &&
                                  currentPipeline &&
                                  template?.data?.inputSetTemplateYaml &&
                                  existingProvide === 'existing' && (
                                    <InputSetSelector
                                      pipelineIdentifier={pipelineIdentifier}
                                      onChange={inputsets => {
                                        setSelectedInputSets(inputsets)
                                      }}
                                      value={selectedInputSets}
                                      gitFilter={gitFilter || undefined}
                                    />
                                  )}
                              </Layout.Vertical>
                            )}
                          </>
                        )}
                        {(existingProvide === 'provide' ||
                          (selectedInputSets && selectedInputSets?.length > 0) ||
                          executionView) && (
                          <PipelineInputSetForm
                            originalPipeline={pipeline}
                            template={parse(template.data.inputSetTemplateYaml).pipeline}
                            readonly={executionView}
                            path=""
                          />
                        )}
                        {existingProvide === 'existing' && selectedInputSets && selectedInputSets?.length > 0 && (
                          <div className={css.noPipelineInputSetForm} />
                        )}
                      </>
                    ) : (
                      <Layout.Horizontal padding="medium" margin="medium">
                        <Text>
                          {executionView
                            ? getString('pipeline.inputSets.noRuntimeInputsWhileExecution')
                            : getString('runPipelineForm.noRuntimeInput')}
                        </Text>
                      </Layout.Horizontal>
                    )}
                  </FormikForm>
                </div>
              ) : (
                <div className={css.editor}>
                  <Layout.Vertical className={css.content} padding="xlarge">
                    <YamlBuilderMemo
                      {...yamlBuilderReadOnlyModeProps}
                      existingJSON={{ pipeline: values }}
                      bind={setYamlHandler}
                      invocationMap={factory.getInvocationMap()}
                      height="55vh"
                      width="32vw"
                      showSnippetSection={false}
                      isEditModeSupported={canEdit}
                    />
                  </Layout.Vertical>
                </div>
              )}
              {executionView ? null : (
                <Layout.Horizontal padding={{ left: 'xlarge', right: 'xlarge', top: 'medium', bottom: 'medium' }}>
                  <Checkbox
                    label={getString('pre-flight-check.skipCheckBtn')}
                    background={skipPreFlightCheck ? Color.PRIMARY_2 : Color.GREY_100}
                    color={skipPreFlightCheck ? Color.PRIMARY_7 : Color.BLACK}
                    className={css.footerCheckbox}
                    padding={{ top: 'small', bottom: 'small', left: 'xxlarge', right: 'medium' }}
                    checked={skipPreFlightCheck}
                    onChange={e => setSkipPreFlightCheck(e.currentTarget.checked)}
                  />
                  <Tooltip position="top" content={getString('featureNA')}>
                    <Checkbox
                      background={notifyOnlyMe ? Color.PRIMARY_2 : Color.GREY_100}
                      color={notifyOnlyMe ? Color.PRIMARY_7 : Color.BLACK}
                      className={css.footerCheckbox}
                      margin={{ left: 'medium' }}
                      padding={{ top: 'small', bottom: 'small', left: 'xxlarge', right: 'medium' }}
                      disabled
                      label={getString('runPipelineForm.notifyOnlyMe')}
                      checked={notifyOnlyMe}
                      onChange={e => setNotifyOnlyMe(e.currentTarget.checked)}
                    />
                  </Tooltip>
                </Layout.Horizontal>
              )}
              {executionView ? null : (
                <Layout.Horizontal
                  padding={{ left: 'xlarge', right: 'xlarge', top: 'large', bottom: 'large' }}
                  flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                  className={css.footer}
                >
                  <Layout.Horizontal className={cx(css.actionButtons)}>
                    <RbacButton
                      style={{ backgroundColor: 'var(--green-600' }}
                      intent="primary"
                      type="submit"
                      text={getString('runPipeline')}
                      onClick={event => {
                        event.stopPropagation()
                        if ((!selectedInputSets || selectedInputSets.length === 0) && existingProvide === 'existing') {
                          setExistingProvide('provide')
                        } else {
                          submitForm()
                        }
                      }}
                      permission={{
                        resource: {
                          resourceIdentifier: pipeline?.identifier as string,
                          resourceType: ResourceType.PIPELINE
                        },
                        permission: PermissionIdentifier.EXECUTE_PIPELINE
                      }}
                      disabled={getErrorsList(formErrors).errorCount > 0}
                    />
                    <div className={css.secondaryButton}>
                      <Button
                        id="cancel-runpipeline"
                        text={getString('cancel')}
                        margin={{ left: 'medium' }}
                        background={Color.GREY_50}
                        onClick={() => {
                          if (onClose) {
                            onClose()
                          }
                          history.replace(
                            routes.toPipelineStudio({
                              accountId,
                              projectIdentifier,
                              orgIdentifier,
                              module,
                              pipelineIdentifier,
                              repoIdentifier,
                              branch
                            })
                          )
                        }}
                      />
                    </div>
                  </Layout.Horizontal>
                  <SaveAsInputSet
                    pipeline={pipeline}
                    currentPipeline={currentPipeline}
                    values={values}
                    template={template}
                    canEdit={canEdit}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    createInputSet={createInputSet}
                    createInputSetLoading={createInputSetLoading}
                  />
                </Layout.Horizontal>
              )}
            </Layout.Vertical>
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
      pipeline={pipeline}
    >
      {child}
    </RunPipelineFormWrapper>
  )
}

export interface RunPipelineFormWrapperProps extends PipelineType<PipelinePathProps> {
  children: React.ReactNode
  pipeline?: NgPipeline
}

export function RunPipelineFormWrapper(props: RunPipelineFormWrapperProps): React.ReactElement {
  const { children } = props

  return (
    <React.Fragment>
      <PageBody className={css.runForm}>{children}</PageBody>
    </React.Fragment>
  )
}

export const RunPipelineForm: React.FC<RunPipelineFormProps & InputSetGitQueryParams> = props => {
  return (
    <NestedAccordionProvider>
      <RunPipelineFormBasic {...props} />
    </NestedAccordionProvider>
  )
}
