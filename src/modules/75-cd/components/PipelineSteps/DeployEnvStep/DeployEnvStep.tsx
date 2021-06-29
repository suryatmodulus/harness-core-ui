import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Button,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  useModalHook,
  Text,
  CardSelect,
  Container
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { get, isEmpty, noop, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog, FormGroup, Intent } from '@blueprintjs/core'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { connect, FormikErrors, FormikProps } from 'formik'
import {
  PipelineInfrastructure,
  EnvironmentResponseDTO,
  useGetEnvironmentList,
  getEnvironmentListPromise,
  useCreateEnvironmentV2,
  useUpsertEnvironmentV2
} from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags, PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { Step, StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { errorCheck } from '@common/utils/formikHelpers'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'

import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import css from './DeployEnvStep.module.scss'

const logger = loggerFor(ModuleName.CD)
export interface DeployEnvData extends Omit<PipelineInfrastructure, 'environmentRef'> {
  environmentRef?: string
}

interface NewEditEnvironmentModalProps {
  isEdit: boolean
  isEnvironment: boolean
  data: EnvironmentResponseDTO
  envIdentifier?: string
  formik?: FormikProps<DeployEnvData>
  onCreateOrUpdate(data: EnvironmentResponseDTO): void
  closeModal?: () => void
}

export const NewEditEnvironmentModal: React.FC<NewEditEnvironmentModalProps> = ({
  isEdit,
  data,
  isEnvironment,
  formik,
  onCreateOrUpdate,
  closeModal
}): JSX.Element => {
  const { getString } = useStrings()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  const { loading: createLoading, mutate: createEnvironment } = useCreateEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { loading: updateLoading, mutate: updateEnvironment } = useUpsertEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { showSuccess, showError, clear } = useToaster()

  const onSubmit = React.useCallback(
    async (values: Required<EnvironmentResponseDTO>) => {
      try {
        if (isEdit && !isEnvironment) {
          const response = await updateEnvironment({
            ...omit(values, 'accountId', 'deleted'),
            orgIdentifier,
            projectIdentifier
          })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.environmentUpdated'))
            formik?.setFieldValue('environmentRef', values.identifier)
            onCreateOrUpdate(values)
          }
        } else {
          const response = await createEnvironment({ ...values, orgIdentifier, projectIdentifier })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.environmentCreated'))
            formik?.setFieldValue('environmentRef', values.identifier)
            onCreateOrUpdate(values)
          }
        }
      } catch (e) {
        showError(e?.data?.message || e?.message || getString('commonError'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateOrUpdate, orgIdentifier, projectIdentifier, isEdit, isEnvironment]
  )
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const typeList: { text: string; value: EnvironmentResponseDTO['type'] }[] = [
    {
      text: getString('production'),
      value: 'Production'
    },
    {
      text: getString('nonProduction'),
      value: 'PreProduction'
    }
  ]

  if (createLoading || updateLoading) {
    return <PageSpinner />
  }
  return (
    <Layout.Vertical>
      <Formik<Required<EnvironmentResponseDTO>>
        initialValues={data as Required<EnvironmentResponseDTO>}
        enableReinitialize={false}
        formName="deployEnv"
        onSubmit={values => {
          onSubmit(values)
        }}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Environment' }) }),
          type: Yup.string().required(getString?.('fieldRequired', { field: 'Type' })),
          identifier: IdentifierSchema()
        })}
      >
        {formikProps => (
          <Layout.Vertical
            onKeyDown={e => {
              if (e.key === 'Enter') {
                formikProps.handleSubmit()
              }
            }}
          >
            <NameIdDescriptionTags
              formikProps={formikProps}
              identifierProps={{
                inputLabel: getString('name'),
                inputGroupProps: {
                  inputGroup: {
                    inputRef: ref => (inputRef.current = ref)
                  }
                },
                isIdentifierEditable: !isEdit
              }}
            />
            <FormGroup
              style={{ marginBottom: 'var(--spacing-medium)' }}
              helperText={errorCheck('type', formikProps) ? get(formikProps?.errors, 'type') : null}
              intent={errorCheck('type', formikProps) ? Intent.DANGER : Intent.NONE}
              label={getString('envType')}
              labelFor="type"
            >
              <CardSelect
                cornerSelected={true}
                data={typeList}
                className={css.grid}
                onChange={item => {
                  formikProps.setFieldValue('type', item.value)
                }}
                renderItem={(item, _) => (
                  <Layout.Vertical spacing="large" flex={{ align: 'center-center' }}>
                    <Text font={{ align: 'center' }} style={{ fontSize: 12 }}>
                      {item.text}
                    </Text>
                  </Layout.Vertical>
                )}
                selected={typeList[typeList.findIndex(card => card.value == formikProps.values.type)]}
              >
                {}
              </CardSelect>
            </FormGroup>
            <Container padding={{ top: 'xlarge' }}>
              <Button
                data-id="environment-save"
                onClick={() => formikProps.submitForm()}
                intent="primary"
                text={getString('save')}
              />
              &nbsp; &nbsp;
              <Button text={getString('cancel')} onClick={closeModal} />
            </Container>
          </Layout.Vertical>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

interface DeployEnvironmentProps {
  initialValues: DeployEnvData
  onUpdate?: (data: DeployEnvData) => void
  stepViewType?: StepViewType
  readonly: boolean
  inputSetData?: {
    template?: DeployEnvData
    path?: string
    readonly?: boolean
  }
}

interface DeployEnvironmentState {
  isEdit: boolean
  isEnvironment: boolean
  formik?: FormikProps<DeployEnvData>
  data?: EnvironmentResponseDTO
}

function isEditEnvironment(data: DeployEnvData): boolean {
  if (getMultiTypeFromValue(data.environmentRef) !== MultiTypeInputType.RUNTIME && !isEmpty(data.environmentRef)) {
    return true
  } else if (data.environment && !isEmpty(data.environment.identifier)) {
    return true
  }
  return false
}

const DeployEnvironmentWidget: React.FC<DeployEnvironmentProps> = ({
  initialValues,
  onUpdate,
  readonly
}): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const { showError } = useToaster()
  const { data: environmentsResponse, loading, error, refetch } = useGetEnvironmentList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const [environments, setEnvironments] = React.useState<SelectOption[]>([])
  const [state, setState] = React.useState<DeployEnvironmentState>({
    isEdit: false,
    isEnvironment: false,
    data: { name: '', identifier: '' }
  })
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={onClose}
        isCloseButtonShown
        title={state.isEdit ? getString('editEnvironment') : getString('newEnvironment')}
        className={'padded-dialog'}
      >
        <NewEditEnvironmentModal
          data={state.data || { name: '', identifier: '' }}
          isEnvironment={state.isEnvironment}
          isEdit={state.isEdit}
          formik={state.formik}
          onCreateOrUpdate={values => {
            refetch()
            onUpdate?.({ ...omit(initialValues, 'environment'), environmentRef: values.identifier })
            onClose.call(null)
          }}
          closeModal={onClose}
        />
      </Dialog>
    ),
    [state]
  )

  const onClose = React.useCallback(() => {
    setState({ isEdit: false, isEnvironment: false })
    hideModal()
  }, [hideModal])

  React.useEffect(() => {
    if (!loading) {
      const envList: SelectOption[] = []
      if (environmentsResponse?.data?.content?.length) {
        environmentsResponse.data.content.forEach(env => {
          envList.push({
            label: env.environment?.name || env.environment?.identifier || '',
            value: env.environment?.identifier || ''
          })
        })
      }
      const identifier = initialValues.environment?.identifier
      const isExist = envList.filter(env => env.value === identifier).length > 0
      if (initialValues.environment && identifier && !isExist) {
        const value = { label: initialValues.environment.name || '', value: initialValues.environment.identifier || '' }
        envList.push(value)
      }
      setEnvironments(envList)
    }
  }, [
    loading,
    environmentsResponse,
    environmentsResponse?.data?.content?.length,
    initialValues.environment,
    initialValues.environmentRef
  ])

  if (error?.message) {
    showError(error.message, undefined, 'cd.env.list.error')
  }

  const { expressions } = useVariablesExpression()

  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT,
      resourceIdentifier: environments[0]?.value as string
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT],
    options: {
      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
    }
  })

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT]
  })

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  return (
    <>
      <Formik<DeployEnvData>
        formName="deployEnvStepForm"
        onSubmit={noop}
        validate={values => {
          if (!isEmpty(values.environment)) {
            onUpdate?.({ ...omit(values, 'environmentRef') })
          } else {
            onUpdate?.({ ...omit(values, 'environment'), environmentRef: values.environmentRef })
          }
        }}
        initialValues={{
          ...initialValues,
          ...{ environmentRef: initialValues?.environment?.identifier || initialValues?.environmentRef }
        }}
        validationSchema={Yup.object().shape({
          environmentRef: Yup.string().trim().required(getString('pipelineSteps.environmentTab.environmentIsRequired'))
        })}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik
          const { values, setFieldValue } = formik
          return (
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <FormInput.MultiTypeInput
                label={getString('pipelineSteps.environmentTab.specifyYourEnvironment')}
                tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
                name="environmentRef"
                disabled={readonly}
                useValue
                placeholder={getString('pipelineSteps.environmentTab.selectEnvironment')}
                multiTypeInputProps={{
                  width: 300,
                  onChange: val => {
                    if (
                      values.environment?.identifier &&
                      (val as SelectOption).value !== values.environment.identifier
                    ) {
                      setEnvironments(environments.filter(env => env.value !== values.environment?.identifier))
                      setFieldValue('environment', undefined)
                    }
                  },
                  selectProps: {
                    addClearBtn: !readonly,
                    items: environments
                  },
                  expressions
                }}
                selectItems={environments}
              />
              {getMultiTypeFromValue(values?.environmentRef) === MultiTypeInputType.FIXED && (
                <Button
                  minimal
                  intent="primary"
                  disabled={readonly || (isEditEnvironment(values) ? !canEdit : !canCreate)}
                  onClick={() => {
                    const isEdit = isEditEnvironment(values)
                    if (isEdit) {
                      if (values.environment?.identifier) {
                        setState({
                          isEdit,
                          formik,
                          isEnvironment: true,
                          data: values.environment
                        })
                      } else {
                        setState({
                          isEdit,
                          formik,
                          isEnvironment: false,
                          data: environmentsResponse?.data?.content?.filter(
                            env => env.environment?.identifier === values.environmentRef
                          )?.[0]?.environment as EnvironmentResponseDTO
                        })
                      }
                    } else {
                      setState({
                        isEdit: false,
                        isEnvironment: false,
                        formik
                      })
                    }
                    showModal()
                  }}
                  text={
                    isEditEnvironment(values)
                      ? getString('editEnvironment')
                      : getString('pipelineSteps.environmentTab.newEnvironment')
                  }
                />
              )}
            </Layout.Horizontal>
          )
        }}
      </Formik>
    </>
  )
}

const DeployEnvironmentInputStep: React.FC<DeployEnvironmentProps & { formik?: any }> = ({
  inputSetData,
  initialValues,
  formik
}) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const { showError } = useToaster()
  const [state, setState] = React.useState<DeployEnvironmentState>({
    isEdit: false,
    isEnvironment: false,
    data: { name: '', identifier: '' }
  })
  const { expressions } = useVariablesExpression()
  const { data: environmentsResponse, error, refetch } = useGetEnvironmentList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })
  const [environments, setEnvironments] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={onClose}
        isCloseButtonShown
        title={state.isEdit ? getString('editEnvironment') : getString('newEnvironment')}
        className={'padded-dialog'}
      >
        <NewEditEnvironmentModal
          data={state.data || { name: '', identifier: '' }}
          isEnvironment={state.isEnvironment}
          isEdit={state.isEdit}
          onCreateOrUpdate={values => {
            refetch()
            formik?.setFieldValue(
              `${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}environmentRef`,
              values.identifier
            )
            onClose.call(null)
          }}
          closeModal={onClose}
        />
      </Dialog>
    ),
    [state]
  )

  const onClose = React.useCallback(() => {
    setState({ isEdit: false, isEnvironment: false })
    hideModal()
  }, [hideModal])

  React.useEffect(() => {
    if (environmentsResponse?.data?.content?.length) {
      setEnvironments(
        environmentsResponse.data.content.map(env => ({
          label: env.environment?.name || env.environment?.identifier || '',
          value: env.environment?.identifier || ''
        }))
      )
    }
  }, [environmentsResponse, environmentsResponse?.data?.content?.length])
  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT,
      resourceIdentifier: environments[0]?.value as string
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT],
    options: {
      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
    }
  })

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.ENVIRONMENT
    },
    permissions: [PermissionIdentifier.EDIT_ENVIRONMENT]
  })
  if (error?.message) {
    showError(error.message, undefined, 'cd.env.list.error')
  }
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.environmentRef) === MultiTypeInputType.RUNTIME && (
        <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
          <FormInput.MultiTypeInput
            label={getString('pipelineSteps.environmentTab.specifyYourEnvironment')}
            tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}environmentRef`}
            placeholder={getString('pipelineSteps.environmentTab.selectEnvironment')}
            selectItems={environments}
            useValue
            multiTypeInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              selectProps: {
                addClearBtn: !inputSetData?.readonly,
                items: environments
              },
              expressions
            }}
            disabled={inputSetData?.readonly}
            className={css.inputWidth}
          />
          {getMultiTypeFromValue(initialValues?.environmentRef) === MultiTypeInputType.FIXED && (
            <Button
              minimal
              intent="primary"
              disabled={inputSetData?.readonly || (isEditEnvironment(initialValues) ? !canEdit : !canCreate)}
              onClick={() => {
                const isEdit = isEditEnvironment(initialValues)
                if (isEdit) {
                  setState({
                    isEdit,
                    isEnvironment: false,
                    data: environmentsResponse?.data?.content?.filter(
                      env => env.environment?.identifier === initialValues.environmentRef
                    )?.[0]?.environment as EnvironmentResponseDTO
                  })
                }
                showModal()
              }}
              text={
                isEditEnvironment(initialValues)
                  ? getString('editEnvironment')
                  : getString('pipelineSteps.environmentTab.newEnvironment')
              }
            />
          )}
        </Layout.Horizontal>
      )}
    </>
  )
}
const DeployEnvironmentInputStepFormik = connect(DeployEnvironmentInputStep)
const EnvironmentRegex = /^.+stage\.spec\.infrastructure\.environmentRef$/
export class DeployEnvironmentStep extends Step<DeployEnvData> {
  lastFetched: number
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()
  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(EnvironmentRegex, this.getEnvironmentListForYaml.bind(this))
  }

  protected getEnvironmentListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.infrastructure.environmentRef', ''))
      if (obj.type === 'Deployment') {
        return getEnvironmentListPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier
          }
        }).then(response => {
          const data =
            response?.data?.content?.map(service => ({
              label: service.environment?.name || '',
              insertText: service.environment?.identifier || '',
              kind: CompletionItemKind.Field
            })) || []
          return data
        })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }
  renderStep(props: StepProps<DeployEnvData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, readonly = false } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <DeployEnvironmentInputStepFormik
          initialValues={initialValues}
          readonly={readonly}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    }
    return (
      <DeployEnvironmentWidget
        readonly={readonly}
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
      />
    )
  }
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<DeployEnvData>): FormikErrors<DeployEnvData> {
    const errors: FormikErrors<DeployEnvData> = {}
    const isRequired = viewType === StepViewType.DeploymentForm
    if (
      isEmpty(data?.environmentRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.environmentRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.environmentRef = getString?.('pipelineSteps.environmentTab.environmentIsRequired')
    }
    return errors
  }
  protected stepPaletteVisible = false
  protected type = StepType.DeployEnvironment
  protected stepName = 'Deploy Environment'
  protected stepIcon: IconName = 'main-environments'

  protected defaultValues: DeployEnvData = {}
}
