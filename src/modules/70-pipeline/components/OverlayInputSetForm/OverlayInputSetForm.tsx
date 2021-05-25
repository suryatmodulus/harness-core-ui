import React from 'react'
import { isNull, isUndefined, omit, omitBy } from 'lodash-es'
import cx from 'classnames'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import * as Yup from 'yup'
import { Button, Color, Formik, FormikForm, FormInput, Icon, Layout, SelectOption, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { parse, stringify } from 'yaml'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { NgPipeline } from 'services/cd-ng'

import {
  OverlayInputSetResponse,
  useGetPipeline,
  Failure,
  useGetInputSetsListForPipeline,
  useGetOverlayInputSetForPipeline,
  useCreateOverlayInputSetForPipeline,
  useUpdateOverlayInputSetForPipeline,
  ResponseOverlayInputSetResponse,
  useGetYamlSchema,
  EntityGitDetails
} from 'services/pipeline-ng'

import { useToaster } from '@common/exports'
import type {
  YamlBuilderHandlerBinding,
  YamlBuilderProps,
  InvocationMapFunction,
  CompletionItemInterface
} from '@common/interfaces/YAMLBuilderProps'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import useSaveToGitDialog from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import GitContextForm, { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { useQueryParams } from '@common/hooks'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { InputSetDTO } from '../InputSetForm/InputSetForm'
import css from './OverlayInputSetForm.module.scss'

export interface OverlayInputSetDTO extends Omit<OverlayInputSetResponse, 'identifier'> {
  pipeline?: NgPipeline
  identifier?: string
  repo?: string
  branch?: string
}

const getDefaultInputSet = (): OverlayInputSetDTO => ({
  name: undefined,
  identifier: '',
  description: undefined,
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

enum SelectedView {
  VISUAL = 'VISUAL',
  YAML = 'YAML'
}

const dialogProps: Omit<IDialogProps, 'isOpen'> = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  style: { minWidth: 700, minHeight: 600 }
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

interface InputSetSelectOption extends SelectOption {
  branch?: string
}

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

  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [selectedRepo, setSelectedRepo] = React.useState<string>(overlayInputSetRepoIdentifier || repoIdentifier || '')
  const [selectedBranch, setSelectedBranch] = React.useState<string>(overlayInputSetBranch || branch || '')
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

  const { data: pipeline, loading: loadingPipeline, refetch: refetchPipeline, error: errorPipeline } = useGetPipeline({
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
      return {
        name: inputSetObj.name,
        tags: inputSetObj.tags,
        identifier: inputSetObj.identifier || /* istanbul ignore next */ '',
        description: inputSetObj?.description,
        inputSetReferences: inputSetObj?.inputSetReferences || /* istanbul ignore next */ [],
        gitDetails: inputSetObj.gitDetails ?? {}
      }
    }
    return getDefaultInputSet()
  }, [overlayInputSetResponse?.data])

  const inputSetListOptions: InputSetSelectOption[] = React.useMemo(() => {
    return (
      inputSetList?.data?.content?.map(item => ({
        label: item.name || /* istanbul ignore next */ '',
        value: item.identifier || /* istanbul ignore next */ '',
        branch: item.gitDetails?.branch
      })) || []
    )
  }, [inputSetList?.data?.content?.map, inputSetList])

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
    try {
      let response: ResponseOverlayInputSetResponse | null = null
      /* istanbul ignore else */
      if (isEdit) {
        response = await updateOverlayInputSet(stringify({ overlayInputSet: clearNullUndefined(inputSetObj) }) as any, {
          pathParams: { inputSetIdentifier: inputSetObj.identifier || /* istanbul ignore next */ '' },
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            pipelineIdentifier,
            projectIdentifier,
            ...(gitDetails ? { ...gitDetails, lastObjectId: objectId } : {})
          }
        })
      } else {
        response = await createOverlayInputSet(stringify({ overlayInputSet: clearNullUndefined(inputSetObj) }) as any, {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            pipelineIdentifier,
            projectIdentifier,
            ...(gitDetails ?? {})
          }
        })
      }
      /* istanbul ignore else */
      if (response) {
        if (response.data?.errorResponse) {
          clear()
          showError(getString('inputSets.overlayInputSetSavedError'))
        } else {
          clear()
          showSuccess(getString('inputSets.overlayInputSetSaved'))
        }
      }
      closeForm()
    } catch (_e) {
      // showError(e?.message || i18n.commonError)
    }
  }

  const createUpdateInputSetWithGitDetails = (gitDetails: SaveToGitFormInterface, objectId = '') => {
    createUpdateOverlayInputSet(savedInputSetObj, gitDetails, objectId)
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (data: SaveToGitFormInterface) =>
      createUpdateInputSetWithGitDetails(data, overlayInputSetResponse?.data?.gitDetails?.objectId ?? '')
  })

  const handleSubmit = React.useCallback(
    async (inputSetObj: OverlayInputSetDTO, gitDetails?: EntityGitDetails) => {
      setSavedInputSetObj(omit(inputSetObj, 'repo', 'branch'))
      if (inputSetObj) {
        delete inputSetObj.pipeline
        if (isGitSyncEnabled) {
          openSaveToGitDialog(isEdit, {
            type: 'InputSets',
            name: inputSetObj.name as string,
            identifier: inputSetObj.identifier as string,
            gitDetails: isEdit ? overlayInputSetResponse?.data?.gitDetails : gitDetails
          })
        } else {
          createUpdateOverlayInputSet(omit(inputSetObj, 'repo', 'branch'))
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

  const onDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])

  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])

  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      /* istanbul ignore else */
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      /* istanbul ignore else */
      if (data) {
        const index = parseInt(data, 10)
        arrayHelpers.swap(index, droppedIndex)
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
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
        getString('commonError')
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

  const { loading, data: pipelineSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Pipelines',
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

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

          <Formik<OverlayInputSetDTO & GitContextProps>
            initialValues={{ ...omit(inputSet, 'gitDetails'), repo: repoIdentifier || '', branch: branch || '' }}
            enableReinitialize={true}
            validationSchema={Yup.object().shape({
              name: Yup.string().trim().required(getString('inputSets.nameIsRequired')),
              inputSetReferences: Yup.array().of(Yup.string().required(getString('inputSets.inputSetIsRequired')))
            })}
            onSubmit={values => {
              handleSubmit(values, { repoIdentifier: values.repo, branch: values.branch })
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
                            inputLabel: getString('inputSets.overlaySetName'),
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
                                  ? overlayInputSetResponse?.data?.gitDetails
                                  : { repoIdentifier: selectedRepo, branch: selectedBranch }
                              }
                              onRepoChange={onRepoChange}
                              onBranchChange={onBranchChange}
                            />
                          </GitSyncStoreProvider>
                        )}
                        <Layout.Vertical padding={{ top: 'large', bottom: 'xxxlarge' }} spacing="small">
                          <Text font={{ size: 'medium' }}>{getString('inputSets.selectInputSets')}</Text>
                          <Text icon="info-sign" iconProps={{ color: Color.PRIMARY_4, size: 23, padding: 'small' }}>
                            {getString('inputSets.selectInputSetsHelp')}
                          </Text>
                          <Layout.Vertical padding={{ top: 'xxxlarge', bottom: 'large' }}>
                            <FieldArray
                              name="inputSetReferences"
                              render={arrayHelpers => (
                                <Layout.Vertical>
                                  {formikProps?.values.inputSetReferences?.map((inputReference, index) => (
                                    <Layout.Horizontal
                                      key={`${index}-${inputReference}`}
                                      flex={{ distribution: 'space-between' }}
                                      style={{ alignItems: 'end' }}
                                    >
                                      <Layout.Horizontal
                                        spacing="medium"
                                        style={{ alignItems: 'baseline' }}
                                        draggable={true}
                                        onDragStart={event => {
                                          onDragStart(event, index)
                                        }}
                                        data-testid={inputReference}
                                        onDragEnd={onDragEnd}
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        onDrop={event => onDrop(event, arrayHelpers, index)}
                                      >
                                        <Icon name="drag-handle-vertical" className={css.drag} />
                                        <Text>{`${index + 1}.`}</Text>
                                        <FormInput.Select
                                          items={inputSetListOptions}
                                          name={`inputSetReferences[${index}]`}
                                          style={{ width: 400 }}
                                          placeholder={getString('inputSetsText')}
                                          disabled={isReadOnly}
                                        />
                                      </Layout.Horizontal>
                                      <Button
                                        minimal
                                        icon="delete"
                                        onClick={() => arrayHelpers.remove(index)}
                                        disabled={isReadOnly}
                                      />
                                    </Layout.Horizontal>
                                  ))}
                                  <span>
                                    <Button
                                      minimal
                                      text={getString('inputSets.addInputSetPlus')}
                                      intent="primary"
                                      onClick={() => arrayHelpers.push('')}
                                      disabled={isReadOnly}
                                    />
                                  </span>
                                </Layout.Vertical>
                              )}
                            />
                          </Layout.Vertical>
                        </Layout.Vertical>
                      </div>
                      <div className={Classes.DIALOG_FOOTER}>
                        <Button intent="primary" type="submit" text={getString('save')} disabled={isReadOnly} />
                        &nbsp; &nbsp;
                        <Button onClick={closeForm} text={getString('cancel')} />
                      </div>
                    </FormikForm>
                  ) : (
                    <div className={css.editor}>
                      {loading ? (
                        <PageSpinner />
                      ) : (
                        <YAMLBuilder
                          {...yamlBuilderReadOnlyModeProps}
                          existingJSON={{ overlayInputSet: omit(formikProps?.values, 'pipeline', 'repo', 'branch') }}
                          invocationMap={invocationMap}
                          bind={setYamlHandler}
                          schema={pipelineSchema?.data}
                          isReadOnlyMode={isReadOnly}
                          showSnippetSection={false}
                        />
                      )}
                      <Layout.Horizontal padding={{ top: 'medium' }}>
                        <Button
                          intent="primary"
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
                        <Button onClick={closeForm} text={getString('cancel')} />
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
