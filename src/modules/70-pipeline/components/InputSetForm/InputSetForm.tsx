import React from 'react'
import { isEmpty, isNull, isUndefined, omit, omitBy } from 'lodash-es'
import cx from 'classnames'
import { IconName, ITreeNode, Intent } from '@blueprintjs/core'
import {
  Button,
  Collapse,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  Text,
  useNestedAccordion,
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
  useGetYamlSchema
} from 'services/pipeline-ng'

import { useToaster } from '@common/exports'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import type { InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { PageSpinner, NameIdDescriptionTags } from '@common/components'
import routes from '@common/RouteDefinitions'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import StagesTree, { stagesTreeNodeClasses } from '@pipeline/components/StagesTree/StagesTree'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { PipelineInputSetForm } from '../PipelineInputSetForm/PipelineInputSetForm'
import { clearRuntimeInput, validatePipeline, getErrorsList } from '../PipelineStudio/StepUtil'
import { getPipelineTree } from '../PipelineStudio/PipelineUtils'
import { factory } from '../PipelineSteps/Steps/__tests__/StepTestUtil'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import css from './InputSetForm.module.scss'
export interface InputSetDTO extends Omit<InputSetResponse, 'identifier' | 'pipeline'> {
  pipeline?: NgPipeline
  identifier?: string
}

const getDefaultInputSet = (template: NgPipeline): InputSetDTO => ({
  name: undefined,
  identifier: '',
  description: undefined,
  pipeline: template
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
  const history = useHistory()
  const { refetch: refetchTemplate, data: template, loading: loadingTemplate } = useGetTemplateFromPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier },
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
  const [formErrors, setFormErrors] = React.useState<{}>({})
  const { showSuccess, showError } = useToaster()

  const { data: inputSetResponse, refetch, loading: loadingInputSet } = useGetInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier },
    inputSetIdentifier: inputSetIdentifier || '',
    lazy: true
  })

  const [mergeTemplate, setMergeTemplate] = React.useState<string>()
  const { openNestedPath } = useNestedAccordion()
  const { mutate: mergeInputSet, loading: loadingMerge } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, pipelineIdentifier }
  })

  const { mutate: createInputSet, loading: createInputSetLoading } = useCreateInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
  const { mutate: updateInputSet, loading: updateInputSetLoading } = useUpdateInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { data: pipeline, loading: loadingPipeline, refetch: refetchPipeline } = useGetPipeline({
    pipelineIdentifier,
    lazy: true,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
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
        pipeline: clearRuntimeInput(inputYamlObj)
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

  const handleSubmit = React.useCallback(
    async (inputSetObj: InputSetDTO) => {
      if (inputSetObj) {
        try {
          let response: ResponseInputSetResponse | null = null
          if (isEdit) {
            response = await updateInputSet(stringify({ inputSet: clearNullUndefined(inputSetObj) }) as any, {
              pathParams: { inputSetIdentifier: inputSetObj.identifier || /* istanbul ignore next */ '' }
            })
          } else {
            response = await createInputSet(stringify({ inputSet: clearNullUndefined(inputSetObj) }) as any)
          }
          /* istanbul ignore else */
          if (response) {
            if (response.data?.errorResponse) {
              showError(getString('inputSets.inputSetSavedError'))
            } else {
              showSuccess(getString('inputSets.inputSetSaved'))
            }
          }
          history.goBack()
        } catch (e) {
          showError(e?.data?.message || e?.message || getString('commonError'))
        }
      }
    },
    [isEdit, updateInputSet, createInputSet, showSuccess, showError]
  )

  const handleSelectionChange = (id: string): void => {
    setSelectedTreeNodeId(id)
    openNestedPath(id)
    document.getElementById(`${id}-panel`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
              <span>
                <Icon name="warning-sign" intent={Intent.DANGER} />
                {`${errorList.length} problems with Input Set`}
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
  const child = (
    <Container className={css.inputSetForm}>
      <Layout.Vertical spacing="medium">
        <Formik<InputSetDTO>
          initialValues={inputSet}
          enableReinitialize={true}
          validate={values => {
            const errors: FormikErrors<InputSetDTO> = {}
            if (isEmpty(values.name)) {
              errors.name = getString('inputSets.nameIsRequired')
            }
            if (values.pipeline && template?.data?.inputSetTemplateYaml && pipeline?.data?.yamlPipeline) {
              errors.pipeline = validatePipeline(
                values.pipeline,
                parse(template.data.inputSetTemplateYaml).pipeline,
                parse(pipeline.data.yamlPipeline).pipeline,
                getString
              ) as any

              if (isEmpty(errors.pipeline)) delete errors.pipeline
            }
            setFormErrors(errors)
            return errors
          }}
          onSubmit={values => {
            handleSubmit(values)
          }}
        >
          {formikProps => {
            return (
              <>
                {selectedView === SelectedView.VISUAL ? (
                  <div className={css.inputsetGrid}>
                    <div className={css.treeSidebar}>
                      <StagesTree
                        contents={nodes}
                        selectedId={selectedTreeNodeId}
                        selectionChange={handleSelectionChange}
                      />
                    </div>
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
                                  handleSubmit(formikProps.values)
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
                    <Layout.Vertical className={css.content} padding="xlarge">
                      {loading ? (
                        <PageSpinner />
                      ) : (
                        <YamlBuilderMemo
                          {...yamlBuilderReadOnlyModeProps}
                          existingJSON={{ inputSet: omit(formikProps?.values, 'inputSetReferences') }}
                          bind={setYamlHandler}
                          isReadOnlyMode={!isEditable}
                          invocationMap={factory.getInvocationMap()}
                          schema={pipelineSchema?.data}
                          height="calc(100vh - 230px)"
                          width="calc(100vw - 300px)"
                          showSnippetSection={false}
                        />
                      )}
                    </Layout.Vertical>
                    <Layout.Horizontal className={css.footer} padding="xlarge">
                      <Button
                        intent="primary"
                        type="submit"
                        disabled={!isEditable}
                        text={getString('save')}
                        onClick={() => {
                          const latestYaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
                          handleSubmit(parse(latestYaml)?.inputSet)
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
  const [nodes, updateNodes] = React.useState<ITreeNode[]>([])
  const [selectedTreeNodeId, setSelectedTreeNodeId] = React.useState<string>('')

  React.useEffect(() => {
    const parsedPipeline = parse(pipeline?.data?.yamlPipeline || '')
    parsedPipeline &&
      updateNodes(
        getPipelineTree(parsedPipeline.pipeline, stagesTreeNodeClasses, getString, {
          hideNonRuntimeFields: true,
          template: parse(template?.data?.inputSetTemplateYaml || '')?.pipeline
        })
      )
  }, [pipeline?.data?.yamlPipeline, template])

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
}

export function InputSetFormWrapper(props: InputSetFormWrapperProps): React.ReactElement {
  const { isEdit, children, selectedView, handleModeSwitch, loading, inputSet, pipeline } = props
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
                    module
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
