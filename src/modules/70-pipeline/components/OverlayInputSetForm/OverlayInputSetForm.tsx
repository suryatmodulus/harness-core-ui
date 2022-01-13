import React from 'react'
import { defaultTo, isEmpty, isNull, isUndefined, omit, omitBy } from 'lodash-es'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import * as Yup from 'yup'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  Layout,
  Text,
  PageSpinner,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  Heading
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { PipelineInfoConfig } from 'services/cd-ng'

import {
  OverlayInputSetResponse,
  useGetPipeline,
  Failure,
  useGetInputSetsListForPipeline,
  useGetOverlayInputSetForPipeline,
  useCreateOverlayInputSetForPipeline,
  useUpdateOverlayInputSetForPipeline,
  ResponseOverlayInputSetResponse,
  useGetSchemaYaml,
  EntityGitDetails
} from 'services/pipeline-ng'

import { useToaster } from '@common/exports'
import { NameSchema } from '@common/utils/Validation'
import type {
  YamlBuilderHandlerBinding,
  YamlBuilderProps,
  InvocationMapFunction,
  CompletionItemInterface
} from '@common/interfaces/YAMLBuilderProps'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import GitContextForm, { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { useQueryParams } from '@common/hooks'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO } from '../InputSetForm/InputSetForm'
import { InputSetSelector, InputSetSelectorProps } from '../InputSetSelector/InputSetSelector'
import css from './OverlayInputSetForm.module.scss'

export interface OverlayInputSetDTO extends Omit<OverlayInputSetResponse, 'identifier'> {
  pipeline?: PipelineInfoConfig
  identifier?: string
  repo?: string
  branch?: string
}

interface SaveOverlayInputSetDTO {
  overlayInputSet: OverlayInputSetDTO
}

const getDefaultInputSet = (
  orgIdentifier: string,
  projectIdentifier: string,
  pipelineIdentifier: string
): OverlayInputSetDTO => ({
  name: undefined,
  identifier: '',
  description: undefined,
  orgIdentifier,
  projectIdentifier,
  pipelineIdentifier,
  inputSetReferences: [],
  tags: {},
  repo: '',
  branch: ''
})

export interface OverlayInputSetFormProps {
  hideForm: () => void
  identifier?: string
  isReadOnly?: boolean
  overlayInputSetRepoIdentifier?: string
  overlayInputSetBranch?: string
}

const dialogProps: Omit<IDialogProps, 'isOpen'> = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: { minWidth: 700 }
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `overlay-input-set.yaml`,
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

const clearNullUndefined = /* istanbul ignore next */ (data: OverlayInputSetDTO): OverlayInputSetDTO =>
  omitBy(omitBy(data, isUndefined), isNull)

export const OverlayInputSetForm: React.FC<OverlayInputSetFormProps> = ({
  hideForm,
  identifier,
  isReadOnly = false,
  overlayInputSetRepoIdentifier,
  overlayInputSetBranch
}): JSX.Element => {
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = React.useState(true)
  const [isEdit, setIsEdit] = React.useState(false)
  const [savedInputSetObj, setSavedInputSetObj] = React.useState<OverlayInputSetDTO>({})
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [initialGitDetails, setInitialGitDetails] = React.useState<EntityGitDetails>({ repoIdentifier, branch })
  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [selectedRepo, setSelectedRepo] = React.useState<string>(overlayInputSetRepoIdentifier || repoIdentifier || '')
  const [selectedBranch, setSelectedBranch] = React.useState<string>(overlayInputSetBranch || branch || '')
  const [selectedInputSets, setSelectedInputSets] = React.useState<InputSetSelectorProps['value']>()
  const { showSuccess, showError, clear } = useToaster()

  const {
    data: overlayInputSetResponse,
    refetch: refetchOverlay,
    loading: loadingOverlayInputSet,
    error: errorOverlayInputSet
  } = useGetOverlayInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier: overlayInputSetRepoIdentifier,
      branch: overlayInputSetBranch
    },
    inputSetIdentifier: identifier || '',
    lazy: true
  })

  const {
    mutate: createOverlayInputSet,
    error: createOverlayInputSetError,
    loading: createOverlayInputSetLoading
  } = useCreateOverlayInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
  const {
    mutate: updateOverlayInputSet,
    error: updateOverlayInputSetError,
    loading: updateOverlayInputSetLoading
  } = useUpdateOverlayInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const {
    data: inputSetList,
    refetch: refetchInputSetList,
    loading: loadingInputSetList,
    error: errorInputSetList
  } = useGetInputSetsListForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      inputSetType: 'INPUT_SET',
      repoIdentifier: selectedRepo,
      branch: selectedBranch,
      getDefaultFromOtherRepo: true
    },
    debounce: 300,
    lazy: true
  })

  const {
    data: pipeline,
    loading: loadingPipeline,
    refetch: refetchPipeline,
    error: errorPipeline
  } = useGetPipeline({
    pipelineIdentifier,
    lazy: true,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  const inputSet = React.useMemo(() => {
    if (overlayInputSetResponse?.data) {
      const inputSetObj = overlayInputSetResponse?.data
      const parsedInputSetObj = parse(inputSetObj?.overlayInputSetYaml || '')
      if (isGitSyncEnabled && parsedInputSetObj && parsedInputSetObj.overlayInputSet) {
        return {
          name: parsedInputSetObj.overlayInputSet.name as string,
          tags: parsedInputSetObj.overlayInputSet.tags as {
            [key: string]: string
          },
          identifier: parsedInputSetObj.overlayInputSet.identifier as string,
          description: parsedInputSetObj.overlayInputSet.description as string,
          orgIdentifier: parsedInputSetObj.overlayInputSet.orgIdentifier as string,
          projectIdentifier: parsedInputSetObj.overlayInputSet.projectIdentifier as string,
          pipelineIdentifier: parsedInputSetObj.overlayInputSet.pipelineIdentifier as string,
          inputSetReferences: defaultTo(
            parsedInputSetObj.overlayInputSet.inputSetReferences,
            /* istanbul ignore next */ []
          ) as string[],
          gitDetails: defaultTo(inputSetObj.gitDetails, {}),
          entityValidityDetails: defaultTo(inputSetObj.entityValidityDetails, {})
        }
      }
      return {
        name: inputSetObj.name,
        tags: inputSetObj.tags,
        identifier: inputSetObj.identifier || /* istanbul ignore next */ '',
        description: inputSetObj?.description,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        inputSetReferences: inputSetObj?.inputSetReferences || /* istanbul ignore next */ [],
        gitDetails: inputSetObj.gitDetails ?? {},
        entityValidityDetails: inputSetObj.entityValidityDetails ?? {}
      }
    }
    return getDefaultInputSet(orgIdentifier, projectIdentifier, pipelineIdentifier)
  }, [overlayInputSetResponse?.data, isGitSyncEnabled])

  const [disableVisualView, setDisableVisualView] = React.useState(inputSet.entityValidityDetails?.valid === false)

  React.useEffect(() => {
    if (inputSet.entityValidityDetails?.valid === false || selectedView === SelectedView.YAML) {
      setSelectedView(SelectedView.YAML)
    } else {
      setSelectedView(SelectedView.VISUAL)
    }
  }, [inputSet, inputSet.entityValidityDetails?.valid])

  React.useEffect(() => {
    if (inputSet.entityValidityDetails?.valid === false) {
      setDisableVisualView(true)
    } else {
      setDisableVisualView(false)
    }
  }, [inputSet.entityValidityDetails?.valid])

  const inputSetListYaml: CompletionItemInterface[] = React.useMemo(() => {
    return (
      inputSetList?.data?.content?.map(item => ({
        label: item.name || /* istanbul ignore next */ '',
        insertText: item.identifier || /* istanbul ignore next */ '',
        kind: CompletionItemKind.Field
      })) || []
    )
  }, [inputSetList?.data?.content?.map, inputSetList])

  React.useEffect(() => {
    const inputSetsToSelect = inputSet.inputSetReferences?.map(inputSetRef => {
      const foundInputSet = inputSetList?.data?.content?.find(currInputSet => currInputSet.identifier === inputSetRef)
      return {
        ...foundInputSet,
        label: defaultTo(foundInputSet?.name, ''),
        value: defaultTo(foundInputSet?.identifier, ''),
        type: foundInputSet?.inputSetType,
        gitDetails: defaultTo(foundInputSet?.gitDetails, {}),
        inputSetErrorDetails: foundInputSet?.inputSetErrorDetails,
        overlaySetErrorDetails: foundInputSet?.overlaySetErrorDetails
      }
    })
    setSelectedInputSets(inputSetsToSelect)
  }, [inputSetList?.data?.content, inputSet.inputSetReferences])

  React.useEffect(() => {
    if (identifier) {
      setIsEdit(true)
      refetchPipeline()
      refetchInputSetList()
      refetchOverlay({ pathParams: { inputSetIdentifier: identifier } })
    } else {
      refetchPipeline()
      refetchInputSetList()
      setIsEdit(false)
    }
  }, [identifier])

  React.useEffect(() => {
    refetchInputSetList()
  }, [selectedRepo, selectedBranch])

  const onRepoChange = (gitDetails: EntityGitDetails) => {
    setSelectedRepo(gitDetails.repoIdentifier || '')
    setSelectedBranch(gitDetails.branch || '')
  }

  const onBranchChange = (gitDetails: EntityGitDetails) => {
    setSelectedBranch(gitDetails.branch || '')
  }

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
        const inputSetYamlVisual = parse(yaml).overlayInputSet as OverlayInputSetDTO

        inputSet.name = inputSetYamlVisual.name
        inputSet.identifier = inputSetYamlVisual.identifier
        inputSet.description = inputSetYamlVisual.description
        inputSet.pipeline = inputSetYamlVisual.pipeline
        inputSet.inputSetReferences = inputSetYamlVisual.inputSetReferences
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, inputSet]
  )

  const closeForm = React.useCallback(() => {
    setIsOpen(false)
    hideForm()
  }, [hideForm])

  const createUpdateOverlayInputSet = async (
    inputSetObj: InputSetDTO,
    gitDetails?: SaveToGitFormInterface,
    objectId = ''
  ) => {
    let response: ResponseOverlayInputSetResponse | null = null
    try {
      /* istanbul ignore else */
      if (isEdit) {
        response = await updateOverlayInputSet(
          yamlStringify({ overlayInputSet: clearNullUndefined(inputSetObj) }) as any,
          {
            pathParams: { inputSetIdentifier: inputSetObj.identifier || /* istanbul ignore next */ '' },
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier,
              pipelineIdentifier,
              projectIdentifier,
              ...(gitDetails ? { ...gitDetails, lastObjectId: objectId } : {}),
              ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
            }
          }
        )
      } else {
        response = await createOverlayInputSet(
          yamlStringify({ overlayInputSet: clearNullUndefined(inputSetObj) }) as any,
          {
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier,
              pipelineIdentifier,
              projectIdentifier,
              ...(gitDetails ?? {}),
              ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
            }
          }
        )
      }
      /* istanbul ignore else */
      if (response) {
        // This is done because when git sync is enabled, errors are displayed in a modal
        if (!isGitSyncEnabled) {
          if (response.data?.errorResponse) {
            clear()
            showError(getString('inputSets.overlayInputSetSavedError'), undefined, 'pipeline.overlayinputset.error')
          } else {
            clear()
            showSuccess(getString('inputSets.overlayInputSetSaved'))
          }
        } else {
          if (response.data?.errorResponse && !isEmpty(response?.data?.invalidInputSetReferences)) {
            throw {
              data: {
                errors: Object.keys(response?.data?.invalidInputSetReferences ?? {}).map((key: string) => {
                  return {
                    fieldId: key,
                    error:
                      response?.data?.invalidInputSetReferences?.[key] ??
                      getString('inputSets.overlayInputSetSavedError')
                  }
                })
              }
            }
          }
        }
      }
      if (!isGitSyncEnabled) {
        closeForm()
      }
    } catch (e) {
      // This is done because when git sync is enabled, errors are displayed in a modal
      if (!isGitSyncEnabled) {
        showError(e?.data?.message || e?.message || getString('commonError'), undefined, 'pipeline.common.error')
      }
      throw e
    }
    return {
      status: response?.status,
      nextCallback: () => closeForm()
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SaveOverlayInputSetDTO>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: SaveOverlayInputSetDTO,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> =>
      createUpdateOverlayInputSet(payload?.overlayInputSet || savedInputSetObj, gitData, objectId)
  })

  const handleSubmit = React.useCallback(
    async (inputSetObjWithGitInfo: OverlayInputSetDTO, gitDetails?: EntityGitDetails) => {
      const inputSetObj = omit(inputSetObjWithGitInfo, 'repo', 'branch')
      setSavedInputSetObj(inputSetObj)
      setInitialGitDetails(gitDetails as EntityGitDetails)
      if (inputSetObj) {
        delete inputSetObj.pipeline
        if (isGitSyncEnabled) {
          openSaveToGitDialog({
            isEditing: isEdit,
            resource: {
              type: 'InputSets',
              name: inputSetObj.name as string,
              identifier: inputSetObj.identifier as string,
              gitDetails: isEdit ? overlayInputSetResponse?.data?.gitDetails : gitDetails
            },
            payload: { overlayInputSet: inputSetObj }
          })
        } else {
          createUpdateOverlayInputSet(inputSetObj)
        }
      }
    },
    [
      isEdit,
      showSuccess,
      closeForm,
      showError,
      createOverlayInputSet,
      updateOverlayInputSet,
      isGitSyncEnabled,
      overlayInputSetResponse,
      pipeline
    ]
  )

  /* istanbul ignore else */
  if (
    errorPipeline ||
    createOverlayInputSetError ||
    updateOverlayInputSetError ||
    errorOverlayInputSet ||
    errorInputSetList
  ) {
    /* istanbul ignore next */
    clear()
    showError(
      (errorPipeline?.data as Failure)?.message ||
        (createOverlayInputSetError?.data as Failure)?.message ||
        (updateOverlayInputSetError?.data as Failure)?.message ||
        (errorOverlayInputSet?.data as Failure)?.message ||
        (errorInputSetList?.data as Failure)?.message ||
        getString('commonError'),
      undefined,
      'pipeline.common.error'
    )
  }

  const invocationMap: YamlBuilderProps['invocationMap'] = new Map<RegExp, InvocationMapFunction>()
  invocationMap.set(
    /^.+\.inputSetReferences$/,
    (_matchingPath: string, _currentYaml: string): Promise<CompletionItemInterface[]> => {
      return new Promise(resolve => {
        resolve(inputSetListYaml)
      })
    }
  )

  const { loading, data: pipelineSchema } = useGetSchemaYaml({
    queryParams: {
      entityType: 'Pipelines',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const selectedInputSetReferences: string[] | undefined = React.useMemo(() => {
    return selectedInputSets?.map(currInputSet => defaultTo(currInputSet.identifier, currInputSet.value) as string)
  }, [selectedInputSets])

  return (
    <Dialog
      title={
        isEdit
          ? getString('inputSets.editOverlayTitle', { name: inputSet.name })
          : getString('inputSets.newOverlayInputSet')
      }
      onClose={() => closeForm()}
      isOpen={isOpen}
      {...dialogProps}
    >
      {(loadingPipeline ||
        createOverlayInputSetLoading ||
        updateOverlayInputSetLoading ||
        loadingInputSetList ||
        loadingOverlayInputSet) && /* istanbul ignore next */ <PageSpinner />}
      <div className={Classes.DIALOG_BODY}>
        <Layout.Vertical spacing="medium">
          <div className={css.optionBtns}>
            <VisualYamlToggle
              selectedView={selectedView}
              onChange={nextMode => {
                handleModeSwitch(nextMode)
              }}
              disableToggle={disableVisualView}
            />
          </div>

          <Formik<OverlayInputSetDTO & GitContextProps>
            initialValues={{
              ...omit(inputSet, 'gitDetails', 'entityValidityDetails'),
              repo: repoIdentifier || '',
              branch: branch || ''
            }}
            formName="overlayInputSet"
            enableReinitialize={true}
            validationSchema={Yup.object().shape({
              name: NameSchema({ requiredErrorMsg: getString('common.validation.nameIsRequired') }),
              inputSetReferences: Yup.array().of(Yup.string().required(getString('inputSets.inputSetIsRequired')))
            })}
            onSubmit={values => {
              handleSubmit(
                { ...values, inputSetReferences: selectedInputSetReferences },
                { repoIdentifier: values.repo, branch: values.branch }
              )
            }}
          >
            {formikProps => {
              return (
                <>
                  {selectedView === SelectedView.VISUAL ? (
                    <FormikForm>
                      <div className={css.inputSetForm}>
                        <NameIdDescriptionTags
                          className={css.inputSetName}
                          identifierProps={{
                            inputLabel: getString('name'),
                            isIdentifierEditable: !isEdit && !isReadOnly,
                            inputGroupProps: {
                              disabled: isReadOnly
                            }
                          }}
                          descriptionProps={{ disabled: isReadOnly }}
                          tagsProps={{
                            disabled: isReadOnly
                          }}
                          formikProps={formikProps}
                        />
                        {isGitSyncEnabled && (
                          <GitSyncStoreProvider>
                            <GitContextForm
                              formikProps={formikProps}
                              gitDetails={
                                isEdit
                                  ? { ...overlayInputSetResponse?.data?.gitDetails, getDefaultFromOtherRepo: false }
                                  : {
                                      repoIdentifier,
                                      branch,
                                      getDefaultFromOtherRepo: true
                                    }
                              }
                              onRepoChange={onRepoChange}
                              onBranchChange={onBranchChange}
                            />
                          </GitSyncStoreProvider>
                        )}
                        <Layout.Vertical padding={{ top: 'large', bottom: 'xxxlarge' }} spacing="small">
                          <Heading level={5}>{getString('inputSets.selectInputSets')}</Heading>
                          <Text
                            icon="info-sign"
                            iconProps={{ intent: 'primary', size: 16, padding: { left: 0, right: 'small' } }}
                          >
                            {getString('inputSets.selectInputSetsHelp')}
                          </Text>
                          {inputSet && (
                            <GitSyncStoreProvider>
                              <InputSetSelector
                                pipelineIdentifier={pipelineIdentifier}
                                onChange={inputsets => {
                                  setSelectedInputSets(inputsets)
                                }}
                                value={selectedInputSets}
                                selectedRepo={selectedRepo}
                                selectedBranch={selectedBranch}
                                isOverlayInputSet={true}
                                selectedValueClass={css.selectedInputSetsContainer}
                              />
                            </GitSyncStoreProvider>
                          )}
                        </Layout.Vertical>
                      </div>
                      <Layout.Horizontal padding={{ top: 'medium' }}>
                        <Button
                          variation={ButtonVariation.PRIMARY}
                          type="submit"
                          text={getString('save')}
                          disabled={isReadOnly}
                        />
                        &nbsp; &nbsp;
                        <Button variation={ButtonVariation.TERTIARY} onClick={closeForm} text={getString('cancel')} />
                      </Layout.Horizontal>
                    </FormikForm>
                  ) : (
                    <div className={css.editor}>
                      {loading ? (
                        <PageSpinner />
                      ) : (
                        <YAMLBuilder
                          {...yamlBuilderReadOnlyModeProps}
                          existingJSON={{
                            overlayInputSet: {
                              ...omit(formikProps?.values, 'pipeline', 'repo', 'branch'),
                              inputSetReferences: selectedInputSetReferences
                            }
                          }}
                          invocationMap={invocationMap}
                          bind={setYamlHandler}
                          schema={pipelineSchema?.data}
                          isReadOnlyMode={isReadOnly}
                          showSnippetSection={false}
                          isEditModeSupported={!isReadOnly}
                        />
                      )}
                      <Layout.Horizontal padding={{ top: 'medium' }}>
                        <Button
                          variation={ButtonVariation.PRIMARY}
                          type="submit"
                          text={getString('save')}
                          onClick={() => {
                            const latestYaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''

                            handleSubmit(parse(latestYaml)?.overlayInputSet, {
                              repoIdentifier: formikProps.values.repo,
                              branch: formikProps.values.branch
                            })
                          }}
                          disabled={isReadOnly}
                        />
                        &nbsp; &nbsp;
                        <Button variation={ButtonVariation.TERTIARY} onClick={closeForm} text={getString('cancel')} />
                      </Layout.Horizontal>
                    </div>
                  )}
                </>
              )
            }}
          </Formik>
        </Layout.Vertical>
      </div>
    </Dialog>
  )
}
