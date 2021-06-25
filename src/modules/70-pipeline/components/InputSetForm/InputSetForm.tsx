import React from 'react'
import * as Yup from 'yup'
import { cloneDeep, isEmpty, isNull, isUndefined, omit, omitBy } from 'lodash-es'
import { Button, Container, Formik, FormikForm, Layout, Text, NestedAccordionProvider } from '@wings-software/uicore'
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
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import GitContextForm, { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import VisualYamlToggle from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { changeEmptyValuesToRunTimeInput } from '@pipeline/utils/stageHelpers'
import { PipelineInputSetForm } from '../PipelineInputSetForm/PipelineInputSetForm'
import { clearRuntimeInput, validatePipeline } from '../PipelineStudio/StepUtil'
import { factory } from '../PipelineSteps/Steps/__tests__/StepTestUtil'
import { getFormattedErrors } from '../RunPipelineModal/RunPipelineHelper'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import GitPopover from '../GitPopover/GitPopover'
import { ErrorsStrip } from '../ErrorsStrip/ErrorsStrip'
import { StepViewType } from '../AbstractSteps/Step'
import css from './InputSetForm.module.scss'
export interface InputSetDTO extends Omit<InputSetResponse, 'identifier' | 'pipeline'> {
  pipeline?: NgPipeline
  identifier?: string
  repo?: string
  branch?: string
}

interface SaveInputSetDTO {
  inputSet: InputSetDTO
}

const getDefaultInputSet = (template: NgPipeline, orgIdentifier: string, projectIdentifier: string): InputSetDTO => ({
  name: undefined,
  identifier: '',
  description: undefined,
  orgIdentifier,
  projectIdentifier,
  pipeline: template,
  repo: '',
  branch: ''
})

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

const clearNullUndefined = /* istanbul ignore next */ (data: InputSetDTO): InputSetDTO => {
  const omittedInputset = omitBy(omitBy(data, isUndefined), isNull)
  return changeEmptyValuesToRunTimeInput(cloneDeep(omittedInputset))
}

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
        orgIdentifier,
        projectIdentifier,
        pipeline: clearRuntimeInput(inputYamlObj),
        gitDetails: inputSetObj.gitDetails ?? {}
      }
    }
    return getDefaultInputSet(
      clearRuntimeInput(parse(template?.data?.inputSetTemplateYaml || /* istanbul ignore next */ '')?.pipeline as any),
      orgIdentifier,
      projectIdentifier
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
          showError(e?.data?.message || e?.message, undefined, 'pipeline.get.template')
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

  const createUpdateInputSet = async (inputSetObj: InputSetDTO, gitDetails?: SaveToGitFormInterface, objectId = '') => {
    let response: ResponseInputSetResponse | null = null
    try {
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
            ...(gitDetails ? { ...gitDetails, lastObjectId: objectId } : {}),
            ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
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
            // This is done because when git sync is enabled, errors are displayed in a modal
          } else if (!isGitSyncEnabled) {
            showError(getString('inputSets.inputSetSavedError'), undefined, 'pipeline.create.inputset')
          }
        } else {
          if (!isGitSyncEnabled) {
            showSuccess(getString('inputSets.inputSetSaved'))
            history.goBack()
          }
        }
      }
    } catch (e) {
      // This is done because when git sync is enabled, errors are displayed in a modal
      if (!isGitSyncEnabled) {
        showError(
          e?.data?.message || e?.message || getString('commonError'),
          undefined,
          'pipeline.update.create.inputset'
        )
      }
      throw e
    }
    return {
      status: response?.status, // nextCallback can be added if required
      nextCallback: () => history.goBack()
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SaveInputSetDTO>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: SaveInputSetDTO,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> => createUpdateInputSet(payload?.inputSet || savedInputSetObj, gitData, objectId)
  })

  const handleSubmit = React.useCallback(
    async (inputSetObj: InputSetDTO, gitDetails?: EntityGitDetails) => {
      setSavedInputSetObj(omit(inputSetObj, 'repo', 'branch'))
      setInitialGitDetails(gitDetails as EntityGitDetails)
      if (inputSetObj) {
        if (isGitSyncEnabled) {
          openSaveToGitDialog({
            isEditing: isEdit,
            resource: {
              type: 'InputSets',
              name: inputSetObj.name as string,
              identifier: inputSetObj.identifier as string,
              gitDetails: isEdit ? inputSetResponse?.data?.gitDetails : gitDetails
            },
            payload: { inputSet: omit(inputSetObj, 'repo', 'branch') }
          })
        } else {
          createUpdateInputSet(omit(inputSetObj, 'repo', 'branch'))
        }
      }
    },
    [isEdit, updateInputSet, createInputSet, showSuccess, showError, isGitSyncEnabled, inputSetResponse, pipeline]
  )

  const child = (
    <Container className={css.inputSetForm}>
      <Layout.Vertical spacing="medium">
        <Formik<InputSetDTO & GitContextProps>
          initialValues={{ ...omit(inputSet, 'gitDetails'), repo: repoIdentifier || '', branch: branch || '' }}
          enableReinitialize={true}
          formName="inputSetForm"
          validationSchema={Yup.object().shape({
            name: NameSchema(),
            identifier: IdentifierSchema()
          })}
          validate={values => {
            const errors: FormikErrors<InputSetDTO> = {}
            if (values.pipeline && template?.data?.inputSetTemplateYaml && pipeline?.data?.yamlPipeline) {
              errors.pipeline = validatePipeline({
                pipeline: values.pipeline,
                template: parse(template.data.inputSetTemplateYaml).pipeline,
                originalPipeline: parse(pipeline.data.yamlPipeline).pipeline,
                getString,
                viewType: StepViewType.InputSet
              }) as any

              if (isEmpty(errors.pipeline)) delete errors.pipeline
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
                      <ErrorsStrip formErrors={formErrors} />
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
                                  gitDetails={
                                    isEdit
                                      ? { ...inputSet.gitDetails, getDefaultFromOtherRepo: false }
                                      : { repoIdentifier, branch, getDefaultFromOtherRepo: false }
                                  }
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
                    <ErrorsStrip formErrors={formErrors} />
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
                          const inputSetDto: InputSetDTO = parse(latestYaml)?.inputSet
                          handleSubmit(inputSetDto, {
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
        (!isGitSyncEnabled && (createInputSetLoading || updateInputSetLoading)) ||
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
                  url: routes.toCDProjectOverview({ orgIdentifier, projectIdentifier, accountId, module }),
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
                <VisualYamlToggle
                  initialSelectedView={selectedView}
                  beforeOnChange={(nextMode, callback) => {
                    handleModeSwitch(nextMode)
                    callback(nextMode)
                  }}
                ></VisualYamlToggle>
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
