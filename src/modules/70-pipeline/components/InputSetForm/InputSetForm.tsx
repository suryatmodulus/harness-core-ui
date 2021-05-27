import React from 'react'
import { isEmpty, isNull, isUndefined, omit, omitBy } from 'lodash-es'
import cx from 'classnames'
import { IconName, Intent } from '@blueprintjs/core'
import {
  Button,
  Collapse,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  Text,
  NestedAccordionProvider,
  Accordion,
  Icon
} from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { parse, stringify } from 'yaml'
import type { FormikErrors } from 'formik'
import type { NgPipeline } from 'services/cd-ng'
import {
  useGetTemplateFromPipeline,
  useGetPipeline,
  useCreateInputSetForPipeline,
  useGetInputSetForPipeline,
  useUpdateInputSetForPipeline,
  InputSetResponse,
  ResponseInputSetResponse,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  ResponsePMSPipelineResponseDTO,
  InputSetErrorResponse,
  EntityGitDetails
} from 'services/pipeline-ng'

import { useToaster } from '@common/exports'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import type { InputSetGitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { NameIdDescriptionTags } from '@common/components'
import routes from '@common/RouteDefinitions'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { AppStoreContext, useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useQueryParams } from '@common/hooks'
import useSaveToGitDialog from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import GitContextForm, { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { PipelineInputSetForm } from '../PipelineInputSetForm/PipelineInputSetForm'
import { clearRuntimeInput, getErrorsList } from '../PipelineStudio/StepUtil'
import { factory } from '../PipelineSteps/Steps/__tests__/StepTestUtil'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import GitPopover from '../GitPopover/GitPopover'
import css from './InputSetForm.module.scss'
export interface InputSetDTO extends Omit<InputSetResponse, 'identifier' | 'pipeline'> {
  pipeline?: NgPipeline
  identifier?: string
  repo?: string
  branch?: string
}

const getDefaultInputSet = (template: NgPipeline): InputSetDTO => ({
  name: undefined,
  identifier: '',
  description: undefined,
  pipeline: template,
  repo: '',
  branch: ''
})

const collapseProps = {
  collapsedIcon: 'small-plus' as IconName,
  expandedIcon: 'small-minus' as IconName,
  isOpen: false,
  isRemovable: false,
  className: 'collapse'
}

export const BasicInputSetForm: React.FC<{ isEdit: boolean; values: InputSetDTO }> = ({ isEdit, values }) => {
  const { getString } = useStrings()
  const descriptionCollapseProps = Object.assign({}, collapseProps, { heading: getString('description') })
  const tagCollapseProps = Object.assign({}, collapseProps, { heading: getString('tagsLabel') })
  return (
    <div className={css.basicForm}>
      <FormInput.InputWithIdentifier
        isIdentifierEditable={!isEdit}
        inputLabel={getString('inputSets.inputSetName')}
        inputGroupProps={{ placeholder: getString('name') }}
      />
      <div className={css.collapseDiv}>
        <Collapse
          {...descriptionCollapseProps}
          isOpen={(values.description && values.description?.length > 0) || false}
        >
          <FormInput.TextArea name="description" />
        </Collapse>
      </div>
      <div className={css.collapseDiv}>
        <Collapse {...tagCollapseProps} isOpen={values.tags && Object.keys(values.tags).length > 0}>
          <FormInput.KVTagInput name="tags" />
        </Collapse>
      </div>
    </div>
  )
}

enum SelectedView {
  VISUAL = 'VISUAL',
  YAML = 'YAML'
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `input-set.yaml`,
  entityType: 'InputSets',
  width: 620,
  height: 360,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

const clearNullUndefined = /* istanbul ignore next */ (data: InputSetDTO): InputSetDTO =>
  omitBy(omitBy(data, isUndefined), isNull)

export interface InputSetFormProps {
  executionView?: boolean
}

export const InputSetForm: React.FC<InputSetFormProps> = (props): JSX.Element => {
  const { executionView } = props
  const { getString } = useStrings()
  const [isEdit, setIsEdit] = React.useState(false)
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, inputSetIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch, inputSetRepoIdentifier, inputSetBranch } = useQueryParams<InputSetGitQueryParams>()
  const [savedInputSetObj, setSavedInputSetObj] = React.useState<InputSetDTO>({})
  const [initialGitDetails, setInitialGitDetails] = React.useState<EntityGitDetails>({ repoIdentifier, branch })
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const history = useHistory()
  const { refetch: refetchTemplate, data: template, loading: loadingTemplate } = useGetTemplateFromPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true
  })

  const [isEditable] = usePermission(
    {
      resourceScope: {
        projectIdentifier,
        orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [formErrors, setFormErrors] = React.useState<Record<string, any>>({})
  const { showSuccess, showError } = useToaster()

  const { data: inputSetResponse, refetch, loading: loadingInputSet } = useGetInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier: inputSetRepoIdentifier,
      branch: inputSetBranch
    },
    inputSetIdentifier: inputSetIdentifier || '',
    lazy: true
  })

  const [mergeTemplate, setMergeTemplate] = React.useState<string>()
  // const { openNestedPath } = useNestedAccordion()
  const { mutate: mergeInputSet, loading: loadingMerge } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch,
      repoIdentifier: inputSetRepoIdentifier,
      branch: inputSetBranch
    }
  })

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
  const { mutate: updateInputSet, loading: updateInputSetLoading } = useUpdateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { data: pipeline, loading: loadingPipeline, refetch: refetchPipeline } = useGetPipeline({
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
    if (inputSetResponse?.data && mergeTemplate) {
      const inputSetObj = inputSetResponse?.data
      const inputYamlObj =
        parse(mergeTemplate || /* istanbul ignore next */ '')?.pipeline || /* istanbul ignore next */ {}

      return {
        name: inputSetObj.name,
        tags: inputSetObj.tags,
        identifier: inputSetObj.identifier || /* istanbul ignore next */ '',
        description: inputSetObj?.description,
        pipeline: clearRuntimeInput(inputYamlObj),
        gitDetails: inputSetObj.gitDetails ?? {}
      }
    }
    return getDefaultInputSet(
      clearRuntimeInput(parse(template?.data?.inputSetTemplateYaml || /* istanbul ignore next */ '')?.pipeline as any)
    )
  }, [mergeTemplate, inputSetResponse?.data, template?.data?.inputSetTemplateYaml])

  React.useEffect(() => {
    if (inputSetIdentifier !== '-1') {
      setIsEdit(true)
      refetch({ pathParams: { inputSetIdentifier: inputSetIdentifier } })
      refetchTemplate()
      refetchPipeline()
      mergeInputSet({ inputSetReferences: [inputSetIdentifier] })
        .then(response => {
          setMergeTemplate(response.data?.pipelineYaml)
        })
        .catch(e => {
          showError(e?.data?.message || e?.message)
        })
    } else {
      refetchTemplate()
      refetchPipeline()

      setIsEdit(false)
    }
  }, [inputSetIdentifier])

  useDocumentTitle([getString('pipelines'), getString('inputSetsText')])

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
        const inputSetYamlVisual = parse(yaml).inputSet as InputSetDTO
        inputSet.name = inputSetYamlVisual.name
        inputSet.identifier = inputSetYamlVisual.identifier
        inputSet.description = inputSetYamlVisual.description
        inputSet.pipeline = inputSetYamlVisual.pipeline
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, inputSet]
  )

  const getFormattedErrors = (apiErrorMap?: { [key: string]: InputSetErrorResponse }): Record<string, any> => {
    const toReturn: Record<string, any> = {}
    if (apiErrorMap) {
      const apiErrorKeys = Object.keys(apiErrorMap)
      apiErrorKeys.forEach(apiErrorKey => {
        const errorsForKey = apiErrorMap[apiErrorKey].errors || []
        if (errorsForKey[0].fieldName) {
          toReturn[errorsForKey[0].fieldName] = `${errorsForKey[0].fieldName}: ${errorsForKey[0].message}`
        }
      })
    }
    return toReturn
  }

  const createUpdateInputSet = async (inputSetObj: InputSetDTO, gitDetails?: SaveToGitFormInterface, objectId = '') => {
    try {
      let response: ResponseInputSetResponse | null = null
      if (isEdit) {
        response = await updateInputSet(stringify({ inputSet: clearNullUndefined(inputSetObj) }) as any, {
          pathParams: {
            inputSetIdentifier: inputSetObj.identifier || /* istanbul ignore next */ ''
          },
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            pipelineIdentifier,
            projectIdentifier,
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch,
            ...(gitDetails ? { ...gitDetails, lastObjectId: objectId } : {})
          }
        })
      } else {
        response = await createInputSet(stringify({ inputSet: clearNullUndefined(inputSetObj) }) as any, {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            pipelineIdentifier,
            projectIdentifier,
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch,
            ...(gitDetails ?? {}),
            ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
          }
        })
      }
      /* istanbul ignore else */
      if (response) {
        if (response.data?.errorResponse) {
          const errors = getFormattedErrors(response.data.inputSetErrorWrapper?.uuidToErrorResponseMap)
          if (Object.keys(errors).length) {
            setFormErrors(errors)
          } else {
            showError(getString('inputSets.inputSetSavedError'))
          }
        } else {
          showSuccess(getString('inputSets.inputSetSaved'))
          history.goBack()
        }
      }
    } catch (e) {
      showError(e?.data?.message || e?.message || getString('commonError'))
    }
  }

  const createUpdateInputSetWithGitDetails = (gitDetails: SaveToGitFormInterface, objectId = '') => {
    createUpdateInputSet(savedInputSetObj, gitDetails, objectId)
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (data: SaveToGitFormInterface) =>
      createUpdateInputSetWithGitDetails(data, inputSetResponse?.data?.gitDetails?.objectId ?? '')
  })

  const handleSubmit = React.useCallback(
    async (inputSetObj: InputSetDTO, gitDetails?: EntityGitDetails) => {
      setSavedInputSetObj(omit(inputSetObj, 'repo', 'branch'))
      setInitialGitDetails(gitDetails as EntityGitDetails)
      if (inputSetObj) {
        if (isGitSyncEnabled) {
          openSaveToGitDialog(isEdit, {
            type: 'InputSets',
            name: inputSetObj.name as string,
            identifier: inputSetObj.identifier as string,
            gitDetails: isEdit ? inputSetResponse?.data?.gitDetails : gitDetails
          })
        } else {
          createUpdateInputSet(omit(inputSetObj, 'repo', 'branch'))
        }
      }
    },
    [isEdit, updateInputSet, createInputSet, showSuccess, showError, isGitSyncEnabled, inputSetResponse, pipeline]
  )

  const renderErrors = React.useCallback(() => {
    const errorList = getErrorsList(formErrors)
    if (!errorList.length) {
      return null
    }
    return (
      <div className={css.errorHeader}>
        <Accordion>
          <Accordion.Panel
            id="errors"
            summary={
              <Layout.Horizontal spacing="small">
                <Icon name="warning-sign" intent={Intent.DANGER} />
                <span>{`${errorList.length} problem${errorList.length > 1 ? 's' : ''} with Input Set`}</span>
              </Layout.Horizontal>
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
  const child = (
    <Container className={css.inputSetForm}>
      <Layout.Vertical spacing="medium">
        <Formik<InputSetDTO & GitContextProps>
          initialValues={{ ...omit(inputSet, 'gitDetails'), repo: repoIdentifier || '', branch: branch || '' }}
          enableReinitialize={true}
          formName="inputSetForm"
          validate={values => {
            const errors: FormikErrors<InputSetDTO> = {}
            if (isEmpty(values.name)) {
              errors.name = getString('inputSets.nameIsRequired')
            }
            setFormErrors(errors)
            return errors
          }}
          onSubmit={values => {
            handleSubmit(values, { repoIdentifier: values.repo, branch: values.branch })
          }}
        >
          {formikProps => {
            return (
              <>
                {selectedView === SelectedView.VISUAL ? (
                  <div className={css.inputsetGrid}>
                    <div>
                      {renderErrors()}

                      <FormikForm>
                        {executionView ? null : (
                          <Layout.Vertical className={css.content} padding="xlarge">
                            <NameIdDescriptionTags
                              className={css.nameiddescription}
                              identifierProps={{
                                inputLabel: getString('inputSets.inputSetName'),
                                isIdentifierEditable: !isEdit && isEditable,
                                inputGroupProps: {
                                  disabled: !isEditable
                                }
                              }}
                              descriptionProps={{ disabled: !isEditable }}
                              tagsProps={{
                                disabled: !isEditable
                              }}
                              formikProps={formikProps}
                            />
                            {isGitSyncEnabled && (
                              <GitSyncStoreProvider>
                                <GitContextForm
                                  formikProps={formikProps}
                                  gitDetails={isEdit ? inputSet.gitDetails : { repoIdentifier, branch }}
                                  className={css.gitContextForm}
                                />
                              </GitSyncStoreProvider>
                            )}
                            {pipeline?.data?.yamlPipeline &&
                              template?.data?.inputSetTemplateYaml &&
                              parse(template.data.inputSetTemplateYaml) && (
                                <PipelineInputSetForm
                                  path="pipeline"
                                  readonly={!isEditable}
                                  originalPipeline={parse(pipeline.data?.yamlPipeline || '').pipeline}
                                  template={parse(template.data?.inputSetTemplateYaml || '').pipeline}
                                />
                              )}
                          </Layout.Vertical>
                        )}
                        <Layout.Horizontal className={css.footer} padding="xlarge">
                          <Button
                            intent="primary"
                            type="submit"
                            onClick={e => {
                              e.preventDefault()
                              formikProps.validateForm().then(() => {
                                if (formikProps?.values?.name?.length && formikProps?.values?.identifier?.length) {
                                  handleSubmit(formikProps.values, {
                                    repoIdentifier: formikProps.values.repo,
                                    branch: formikProps.values.branch
                                  })
                                }
                              })
                            }}
                            text={getString('save')}
                            disabled={!isEditable}
                          />
                          &nbsp; &nbsp;
                          <Button
                            onClick={() => {
                              history.goBack()
                            }}
                            text={getString('cancel')}
                          />
                        </Layout.Horizontal>
                      </FormikForm>
                    </div>
                  </div>
                ) : (
                  <div className={css.editor}>
                    {renderErrors()}
                    <Layout.Vertical className={css.content} padding="xlarge">
                      <YamlBuilderMemo
                        {...yamlBuilderReadOnlyModeProps}
                        existingJSON={{ inputSet: omit(formikProps?.values, 'inputSetReferences', 'repo', 'branch') }}
                        bind={setYamlHandler}
                        isReadOnlyMode={!isEditable}
                        invocationMap={factory.getInvocationMap()}
                        height="calc(100vh - 230px)"
                        width="calc(100vw - 350px)"
                        showSnippetSection={false}
                        isEditModeSupported={isEditable}
                      />
                    </Layout.Vertical>
                    <Layout.Horizontal className={css.footer} padding="xlarge">
                      <Button
                        intent="primary"
                        type="submit"
                        disabled={!isEditable}
                        text={getString('save')}
                        onClick={() => {
                          const latestYaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
                          handleSubmit(parse(latestYaml)?.inputSet, {
                            repoIdentifier: formikProps.values.repo,
                            branch: formikProps.values.branch
                          })
                        }}
                      />
                      &nbsp; &nbsp;
                      <Button
                        onClick={() => {
                          history.goBack()
                        }}
                        text={getString('cancel')}
                      />
                    </Layout.Horizontal>
                  </div>
                )}
              </>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Container>
  )

  return executionView ? (
    child
  ) : (
    <InputSetFormWrapper
      loading={
        loadingInputSet ||
        loadingPipeline ||
        loadingTemplate ||
        createInputSetLoading ||
        updateInputSetLoading ||
        loadingMerge
      }
      isEdit={isEdit}
      selectedView={selectedView}
      handleModeSwitch={handleModeSwitch}
      inputSet={inputSet}
      pipeline={pipeline}
      isGitSyncEnabled={isGitSyncEnabled}
    >
      {child}
    </InputSetFormWrapper>
  )
}

export interface InputSetFormWrapperProps {
  isEdit: boolean
  children: React.ReactNode
  selectedView: SelectedView
  loading: boolean
  handleModeSwitch(mode: SelectedView): void
  inputSet: InputSetDTO
  pipeline: ResponsePMSPipelineResponseDTO | null
  isGitSyncEnabled?: boolean
}

export function InputSetFormWrapper(props: InputSetFormWrapperProps): React.ReactElement {
  const { isEdit, children, selectedView, handleModeSwitch, loading, inputSet, pipeline, isGitSyncEnabled } = props
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { selectedProject: project } = useAppStore()
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <PageHeader
        title={
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
                  url: routes.toInputSetList({
                    orgIdentifier,
                    projectIdentifier,
                    accountId,
                    pipelineIdentifier,
                    module,
                    branch: pipeline?.data?.gitDetails?.branch,
                    repoIdentifier: pipeline?.data?.gitDetails?.repoIdentifier
                  }),
                  label: parse(pipeline?.data?.yamlPipeline || '')?.pipeline.name || ''
                },
                { url: '#', label: isEdit ? inputSet.name : getString('inputSets.newInputSetLabel') }
              ]}
            />
            <Layout.Horizontal>
              <Text font="medium">
                {isEdit
                  ? getString('inputSets.editTitle', { name: inputSet.name })
                  : getString('inputSets.newInputSetLabel')}
              </Text>
              {isGitSyncEnabled && isEdit && (
                <GitPopover data={inputSet.gitDetails || {}} iconMargin={{ left: 'small', top: 'xsmall' }} />
              )}
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
        }
      />

      <PageBody loading={loading}>{children}</PageBody>
    </React.Fragment>
  )
}

export const EnhancedInputSetForm: React.FC<InputSetFormProps> = props => {
  return (
    <NestedAccordionProvider>
      <InputSetForm {...props} />
    </NestedAccordionProvider>
  )
}
