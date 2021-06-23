import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import type { MutateMethod } from 'restful-react'
import * as Yup from 'yup'
import { Tooltip, Dialog, Classes, RadioGroup, Radio, PopoverPosition } from '@blueprintjs/core'
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
  Heading,
  Color,
  Popover
} from '@wings-software/uicore'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { parse, stringify } from 'yaml'
import { pick, merge, isEmpty, isEqual, omit } from 'lodash-es'
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
  CreateInputSetForPipelineQueryParams,
  EntityGitDetails
} from 'services/pipeline-ng'
import { NameSchema } from '@common/utils/Validation'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import { usePermission } from '@rbac/hooks/usePermission'
import { PipelineInputSetForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import type { GitQueryParams, InputSetGitQueryParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { PageBody } from '@common/components/Page/PageBody'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import GitContextForm, { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { useSaveToGitDialog, UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import VisualYamlToggle, { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { clearNullUndefined } from '@pipeline/pages/triggers/utils/TriggersWizardPageUtils'
import { ErrorsStrip } from '@pipeline/components/ErrorsStrip/ErrorsStrip'
import type { InputSetDTO } from '../InputSetForm/InputSetForm'
import { InputSetSelector, InputSetSelectorProps } from '../InputSetSelector/InputSetSelector'
import { clearRuntimeInput, validatePipeline, getErrorsList } from '../PipelineStudio/StepUtil'
import { PreFlightCheckModal } from '../PreFlightCheckModal/PreFlightCheckModal'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import type { Values } from '../PipelineStudio/StepCommands/StepCommandTypes'
import factory from '../PipelineSteps/PipelineStepFactory'
import { getFormattedErrors, mergeTemplateWithInputSetData } from './RunPipelineHelper'
import { StepViewType } from '../AbstractSteps/Step'
import GitPopover from '../GitPopover/GitPopover'
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

interface SaveAsInputSetProps {
  pipeline?: NgPipeline
  currentPipeline?: { pipeline?: NgPipeline }
  template: ResponseInputSetTemplateResponse | null
  values: Values
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  canEdit: boolean
  createInputSetLoading: boolean
  createInputSet: MutateMethod<ResponseInputSetResponse, void, CreateInputSetForPipelineQueryParams, void>
  repoIdentifier?: string
  branch?: string
  isGitSyncEnabled?: boolean
  setFormErrors: Dispatch<SetStateAction<FormikErrors<InputSetDTO>>>
  getInputSetsList: () => void
}

const SaveAsInputSet = ({
  pipeline,
  currentPipeline,
  template,
  orgIdentifier,
  projectIdentifier,
  accountId,
  values,
  canEdit,
  createInputSet,
  createInputSetLoading,
  repoIdentifier,
  branch,
  isGitSyncEnabled = false,
  setFormErrors,
  getInputSetsList
}: SaveAsInputSetProps): JSX.Element | null => {
  const { getString } = useStrings()

  const { showError, showSuccess } = useToaster()
  const [savedInputSetObj, setSavedInputSetObj] = React.useState<InputSetDTO>({})
  const [initialGitDetails, setInitialGitDetails] = React.useState<EntityGitDetails>({ repoIdentifier, branch })

  const createUpdateInputSet = async (
    inputSetObj: InputSetDTO,
    gitDetails?: SaveToGitFormInterface,
    payload?: Omit<InputSetDTO, 'repo' | 'branch'>
  ): Promise<UseSaveSuccessResponse> => {
    try {
      const response = await createInputSet(
        stringify({
          inputSet: { ...clearNullUndefined(payload || inputSetObj), orgIdentifier, projectIdentifier }
        }) as any,
        {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            pipelineIdentifier: pipeline?.identifier as string,
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch,
            ...(gitDetails ?? {}),
            ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
          }
        }
      )
      if (response.data?.errorResponse) {
        const errors = getFormattedErrors(response.data.inputSetErrorWrapper?.uuidToErrorResponseMap)
        if (Object.keys(errors).length) {
          setFormErrors(errors)
        } else {
          showError(getString('inputSets.inputSetSavedError'), undefined, 'pipeline.save.inputset.error')
        }
      } else {
        showSuccess(getString('inputSets.inputSetSaved'))
      }
      return {
        status: response?.status // nextCallback can be added if required
      }
    } catch (e) {
      showError(e?.data?.message)
      // throw error here so that it's uncaught in handleSubmit and we don'tr end up reloading the modal
      throw e
    }
  }

  const createUpdateInputSetWithGitDetails = (gitDetails: SaveToGitFormInterface): Promise<UseSaveSuccessResponse> => {
    return createUpdateInputSet(savedInputSetObj, gitDetails).then(resp => {
      getInputSetsList()
      return resp
    })
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (
      data: SaveToGitFormInterface,
      _payload?: Omit<InputSetDTO, 'repo' | 'branch'>
    ): Promise<UseSaveSuccessResponse> => Promise.resolve(createUpdateInputSetWithGitDetails(data))
  })

  const handleSubmit = React.useCallback(
    async (inputSetObj: InputSetDTO, gitDetails?: EntityGitDetails) => {
      setSavedInputSetObj(omit(inputSetObj, 'repo', 'branch'))
      setInitialGitDetails(gitDetails as EntityGitDetails)

      if (inputSetObj) {
        if (isGitSyncEnabled) {
          openSaveToGitDialog({
            isEditing: false,
            resource: {
              type: 'InputSets',
              name: inputSetObj.name as string,
              identifier: inputSetObj.identifier as string,
              gitDetails: gitDetails
            },
            payload: omit(inputSetObj, 'repo', 'branch')
          })
        } else {
          createUpdateInputSet(omit(inputSetObj, 'repo', 'branch')).then(() => {
            getInputSetsList()
          })
        }
      }
    },
    [createInputSet, showSuccess, showError, isGitSyncEnabled, pipeline]
  )

  if (pipeline && currentPipeline && template?.data?.inputSetTemplateYaml) {
    return (
      <Popover
        disabled={!canEdit}
        content={
          <div>
            <Formik<InputSetDTO & GitContextProps>
              formName="runPipelineForm"
              onSubmit={input => {
                handleSubmit(input, { repoIdentifier: input.repo, branch: input.branch })
              }}
              validationSchema={Yup.object().shape({
                name: NameSchema({ requiredErrorMsg: getString('inputSets.nameIsRequired') })
              })}
              initialValues={
                {
                  pipeline: values,
                  name: '',
                  identifier: '',
                  repo: repoIdentifier || '',
                  branch: branch || ''
                } as InputSetDTO & GitContextProps
              }
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
                    {isGitSyncEnabled && (
                      <GitSyncStoreProvider>
                        <GitContextForm
                          formikProps={createInputSetFormikProps}
                          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: false }}
                        />
                      </GitSyncStoreProvider>
                    )}
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
        <RbacButton
          minimal
          intent="primary"
          text={getString('inputSets.saveAsInputSet')}
          permission={{
            permission: PermissionIdentifier.EDIT_PIPELINE,
            resource: {
              resourceType: ResourceType.PIPELINE
            }
          }}
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
  const [triggerValidation, setTriggerValidation] = useState(false)
  const [runClicked, setRunClicked] = useState(false)

  React.useEffect(() => {
    getInputSetsList()
  }, [])

  const { mutate: createInputSet, loading: createInputSetLoading } = useCreateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
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
      const parsedYAML = parse(inputSetYAML)
      setExistingProvide('provide')
      setCurrentPipeline(parsedYAML)
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
      moduleType: module,
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

  const {
    refetch: getInputSetsList,
    data: inputSetResponse,
    loading: inputSetLoading
  } = useGetInputSetsListForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true
  })

  const inputSets = inputSetResponse?.data?.content

  const yamlTemplate = React.useMemo(() => {
    return parse(template?.data?.inputSetTemplateYaml || '')?.pipeline
  }, [template?.data?.inputSetTemplateYaml])

  useEffect(() => {
    setTriggerValidation(true)
  }, [currentPipeline])

  React.useEffect(() => {
    const toBeUpdated = merge(parse(template?.data?.inputSetTemplateYaml || ''), currentPipeline || {}) as {
      pipeline: NgPipeline
    }
    setCurrentPipeline(toBeUpdated)
  }, [template?.data?.inputSetTemplateYaml])

  React.useEffect(() => {
    setSelectedInputSets(inputSetSelected)
  }, [inputSetSelected])

  React.useEffect(() => {
    if (template?.data?.inputSetTemplateYaml) {
      const parsedTemplate = parse(template?.data?.inputSetTemplateYaml) as { pipeline: NgPipeline }
      if ((selectedInputSets && selectedInputSets.length > 1) || selectedInputSets?.[0]?.type === 'OVERLAY_INPUT_SET') {
        const fetchData = async (): Promise<void> => {
          try {
            const data = await mergeInputSet({
              inputSetReferences: selectedInputSets.map(item => item.value as string)
            })
            if (data?.data?.pipelineYaml) {
              const inputSetPortion = parse(data.data.pipelineYaml) as {
                pipeline: NgPipeline
              }
              const toBeUpdated = mergeTemplateWithInputSetData(parsedTemplate, inputSetPortion)
              setCurrentPipeline(toBeUpdated)
            }
          } catch (e) {
            showError(e?.data?.message || e?.message, undefined, 'pipeline.feth.inputSetTemplateYaml.error')
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
              const inputSetPortion = pick(parse(data.data.inputSetYaml)?.inputSet, 'pipeline') as {
                pipeline: NgPipeline
              }
              const toBeUpdated = mergeTemplateWithInputSetData(parsedTemplate, inputSetPortion)
              setCurrentPipeline(toBeUpdated)
            }
          }
        }
        fetchData()
      } else if (!selectedInputSets?.length && !inputSetYAML?.length) {
        setCurrentPipeline(parsedTemplate)
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
      if (Object.keys(formErrors).length) {
        return
      }
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
      skipPreFlightCheck,
      formErrors
    ]
  )

  const [existingProvide, setExistingProvide] = React.useState('existing')

  useEffect(() => {
    if (inputSets && !(inputSets.length > 0)) {
      setExistingProvide('provide')
    }
  }, [inputSets])

  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [lastYaml, setLastYaml] = useState({})

  const handleModeSwitch = useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const presentPipeline = parse(yamlHandler?.getLatestYaml() || '') as { pipeline: NgPipeline }
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
      triggerValidation &&
      currentPipeline?.pipeline &&
      template?.data?.inputSetTemplateYaml &&
      yamlTemplate &&
      pipeline &&
      runClicked
    ) {
      errors = validatePipeline({
        pipeline: { ...clearRuntimeInput(currentPipeline.pipeline) },
        template: parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
        originalPipeline: currentPipeline.pipeline,
        getString,
        viewType: StepViewType.DeploymentForm
      }) as any
      setFormErrors(errors)
      // triggerValidation should be true every time 'currentPipeline' changes
      // and it needs to be set as false here so that we do not trigger it indefinitely
      setTriggerValidation(false)
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

  if (loadingPipeline || loadingTemplate || runLoading || inputSetLoading) {
    return <PageSpinner />
  }

  const renderPipelineInputSetForm = () => {
    if (loadingUpdate) {
      return (
        <PageSpinner
          className={css.inputSetsUpdatingSpinner}
          message={getString('pipeline.inputSets.applyingInputSets')}
        />
      )
    }
    if (pipeline && template?.data?.inputSetTemplateYaml) {
      return (
        <PipelineInputSetForm
          originalPipeline={pipeline}
          template={parse(template.data.inputSetTemplateYaml).pipeline}
          readonly={executionView}
          path=""
        />
      )
    }
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

          function validateErrors(): Promise<FormikErrors<InputSetDTO>> {
            return new Promise(resolve => {
              setTimeout(() => {
                const validatedErrors =
                  (validatePipeline({
                    pipeline: values as NgPipeline,
                    template: parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
                    originalPipeline: pipeline,
                    getString,
                    viewType: StepViewType.DeploymentForm
                  }) as any) || formErrors
                resolve(validatedErrors)
              }, 300)
            })
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
                    {isGitSyncEnabled && (
                      <GitPopover
                        data={pipelineResponse?.data?.gitDetails ?? {}}
                        iconMargin={{ left: 'small', top: 'xsmall' }}
                      />
                    )}
                    <div className={css.optionBtns}>
                      <VisualYamlToggle
                        initialSelectedView={selectedView}
                        beforeOnChange={(nextMode, callback) => {
                          handleModeSwitch(nextMode)
                          callback(nextMode)
                        }}
                        disableYaml={!template?.data?.inputSetTemplateYaml}
                      />
                    </div>
                  </div>
                  <ErrorsStrip formErrors={formErrors} />
                </>
              )}
              {selectedView === SelectedView.VISUAL ? (
                <div className={executionView ? css.runModalFormContentExecutionView : css.runModalFormContent}>
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
                                            {getString('pipeline.inputSets.aboutInputSets')}
                                            <a
                                              href="https://ngdocs.harness.io/article/3fqwa8et3d-input-sets"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              {getString('learnMore')}
                                            </a>
                                          </Text>
                                        }
                                      >
                                        {getString('pipeline.triggers.pipelineInputPanel.whatAreInputsets')}
                                      </Text>
                                    </span>
                                  </Layout.Horizontal>
                                  {isGitSyncEnabled && existingProvide === 'existing' && (
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
                        {existingProvide === 'provide' ||
                        (selectedInputSets && selectedInputSets?.length > 0) ||
                        executionView
                          ? renderPipelineInputSetForm()
                          : null}
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
                      schema={{}}
                      invocationMap={factory.getInvocationMap()}
                      height="55vh"
                      width="100%"
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
                        setRunClicked(true)
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
                    accountId={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    createInputSet={createInputSet}
                    createInputSetLoading={createInputSetLoading}
                    repoIdentifier={repoIdentifier}
                    branch={branch}
                    isGitSyncEnabled={isGitSyncEnabled}
                    setFormErrors={setFormErrors}
                    getInputSetsList={getInputSetsList}
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
