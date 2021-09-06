import React from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  IconName,
  Layout,
  MultiTypeInputType,
  SelectOption,
  useModalHook
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { get, isEmpty, isNil, noop, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { connect, FormikErrors, FormikProps } from 'formik'
import {
  getServiceListPromise,
  ServiceConfig,
  ServiceRequestDTO,
  ServiceResponseDTO,
  ServiceYaml,
  useCreateServicesV2,
  useGetServiceAccessList,
  useGetServiceList,
  useUpsertServiceV2
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { Step, StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'

import { NameIdDescriptionTags, PageSpinner } from '@common/components'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import css from './DeployServiceStep.module.scss'

const logger = loggerFor(ModuleName.CD)
export interface DeployServiceData extends Omit<ServiceConfig, 'serviceRef'> {
  serviceRef?: string
}

interface NewEditServiceModalProps {
  isEdit: boolean
  isService: boolean
  data: ServiceResponseDTO
  serviceIdentifier?: string
  onCreateOrUpdate(data: ServiceRequestDTO): void
  closeModal?: () => void
}

export const NewEditServiceModal: React.FC<NewEditServiceModalProps> = ({
  isEdit,
  data,
  isService,
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

  const { loading: createLoading, mutate: createService } = useCreateServicesV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { loading: updateLoading, mutate: updateService } = useUpsertServiceV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const { showSuccess, showError, clear } = useToaster()

  const onSubmit = React.useCallback(
    async (values: ServiceRequestDTO) => {
      try {
        if (isEdit && !isService) {
          const response = await updateService({
            ...omit(values, 'accountId', 'deleted'),
            orgIdentifier,
            projectIdentifier
          })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.serviceUpdated'))
            onCreateOrUpdate(values)
          }
        } else {
          const response = await createService([{ ...values, orgIdentifier, projectIdentifier }])
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.serviceCreated'))
            onCreateOrUpdate(values)
          }
        }
      } catch (e) {
        showError(e?.data?.message || e?.message || getString('commonError'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateOrUpdate, orgIdentifier, projectIdentifier, isEdit, isService]
  )

  if (createLoading || updateLoading) {
    return <PageSpinner />
  }

  return (
    <Formik<Required<ServiceResponseDTO>>
      initialValues={data as Required<ServiceResponseDTO>}
      formName="deployService"
      enableReinitialize={false}
      onSubmit={values => {
        onSubmit(values)
      }}
      validationSchema={Yup.object().shape({
        name: NameSchema({ requiredErrorMsg: getString?.('fieldRequired', { field: 'Service' }) }),
        identifier: IdentifierSchema()
      })}
    >
      {formikProps => (
        <FormikForm>
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
          <Container padding={{ top: 'xlarge' }}>
            <Button
              variation={ButtonVariation.PRIMARY}
              type={'submit'}
              text={getString('save')}
              data-id="service-save"
            />
            &nbsp; &nbsp;
            <Button variation={ButtonVariation.SECONDARY} text={getString('cancel')} onClick={closeModal} />
          </Container>
        </FormikForm>
      )}
    </Formik>
  )
}

interface DeployServiceProps {
  initialValues: DeployServiceData
  onUpdate?: (data: DeployServiceData) => void
  stepViewType?: StepViewType
  readonly: boolean
  inputSetData?: {
    template?: DeployServiceData
    path?: string
    readonly?: boolean
  }
}

interface DeployServiceState {
  isEdit: boolean
  data?: ServiceResponseDTO
  isService: boolean
  formik?: FormikProps<DeployServiceData>
}

function isEditService(data: DeployServiceData): boolean {
  if (getMultiTypeFromValue(data.serviceRef) !== MultiTypeInputType.RUNTIME) {
    if (typeof data.serviceRef === 'object') {
      const serviceRef = (data.serviceRef as SelectOption).value as string
      if (!isEmpty(serviceRef)) {
        return true
      }
    } else if (!isEmpty(data.serviceRef)) {
      return true
    }
  } else if (data.service && !isEmpty(data.service.identifier)) {
    return true
  }
  return false
}

const DeployServiceWidget: React.FC<DeployServiceProps> = ({ initialValues, onUpdate, readonly }): JSX.Element => {
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
  const {
    data: serviceResponse,
    error,
    loading
  } = useGetServiceList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { expressions } = useVariablesExpression()

  const [services, setService] = React.useState<ServiceYaml[]>()
  const [selectOptions, setSelectOptions] = React.useState<SelectOption[]>()

  const [state, setState] = React.useState<DeployServiceState>({ isEdit: false, isService: false })

  const updateServicesList = (value: ServiceRequestDTO) => {
    formikRef.current?.setValues({ serviceRef: value.identifier, ...(state.isService && { service: {} }) })
    if (!isNil(services)) {
      const newService = {
        description: value.description,
        identifier: value.identifier,
        name: value.name || '',
        tags: value.tags
      }
      const newServicesList = [...services]
      const existingIndex = newServicesList.findIndex(item => item.identifier === value.identifier)
      if (existingIndex >= 0) {
        newServicesList.splice(existingIndex, 1, newService)
      } else {
        newServicesList.unshift(newService)
      }
      setService(newServicesList)
    }
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={onClose}
        title={state.isEdit ? getString('editService') : getString('newService')}
        isCloseButtonShown
        className={'padded-dialog'}
      >
        <NewEditServiceModal
          data={state.data || { name: '', identifier: '' }}
          isEdit={state.isEdit}
          isService={state.isService}
          onCreateOrUpdate={value => {
            updateServicesList(value)
            onClose.call(null)
          }}
          closeModal={onClose}
        />
      </Dialog>
    ),
    [state]
  )

  const onClose = React.useCallback(() => {
    setState({ isEdit: false, isService: false })
    hideModal()
  }, [hideModal])

  React.useEffect(() => {
    if (!isNil(selectOptions) && initialValues.serviceRef) {
      if (getMultiTypeFromValue(initialValues.serviceRef) === MultiTypeInputType.FIXED) {
        const doesExist = selectOptions.filter(service => service.value === initialValues.serviceRef).length > 0
        if (!doesExist) {
          formikRef.current?.setFieldValue('serviceRef', '')
        }
      }
    }
  }, [selectOptions])

  React.useEffect(() => {
    if (!isNil(services)) {
      setSelectOptions(
        services.map(service => {
          return { label: service.name, value: service.identifier }
        })
      )
    }
  }, [services])

  React.useEffect(() => {
    if (!loading) {
      const serviceList: ServiceYaml[] = []
      if (serviceResponse?.data?.content?.length) {
        serviceResponse.data.content.forEach(service => {
          serviceList.push({
            description: service.service?.description,
            identifier: service.service?.identifier || '',
            name: service.service?.name || '',
            tags: service.service?.tags
          })
        })
      }
      if (initialValues.service) {
        const identifier = initialValues.service.identifier
        const isExist = serviceList.filter(service => service.identifier === identifier).length > 0
        if (initialValues.service && identifier && !isExist) {
          serviceList.push({
            description: initialValues.service?.description,
            identifier: initialValues.service?.identifier || '',
            name: initialValues.service?.name || '',
            tags: initialValues.service?.tags
          })
        }
      }
      setService(serviceList)
    }
  }, [loading, serviceResponse, serviceResponse?.data?.content?.length])

  if (error?.message) {
    showError(error.message, undefined, 'cd.svc.list.error')
  }

  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.SERVICE,
      resourceIdentifier: services ? (services[0]?.identifier as string) : ''
    },
    permissions: [PermissionIdentifier.EDIT_SERVICE],
    options: {
      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
    }
  })

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.SERVICE
    },
    permissions: [PermissionIdentifier.EDIT_SERVICE]
  })

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const serviceRef = initialValues?.service?.identifier || initialValues?.serviceRef

  const [type, setType] = React.useState<MultiTypeInputType>(getMultiTypeFromValue(serviceRef))

  return (
    <>
      <Formik<DeployServiceData>
        formName="deployServiceStepForm"
        onSubmit={noop}
        validate={values => {
          if (!isEmpty(values.service)) {
            onUpdate?.({ ...omit(values, 'serviceRef') })
          } else {
            onUpdate?.({ ...omit(values, 'service'), serviceRef: values.serviceRef })
          }
        }}
        initialValues={{
          ...initialValues,
          ...{ serviceRef }
        }}
        validationSchema={Yup.object().shape({
          serviceRef: Yup.string().trim().required(getString('pipelineSteps.serviceTab.serviceIsRequired'))
        })}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
          formikRef.current = formik
          const { values, setFieldValue } = formik
          return (
            <Layout.Horizontal
              className={css.formRow}
              spacing="medium"
              flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
            >
              <FormInput.MultiTypeInput
                tooltipProps={{ dataTooltipId: 'specifyYourService' }}
                label={getString('pipelineSteps.serviceTab.specifyYourService')}
                name="serviceRef"
                useValue
                disabled={readonly || (type === MultiTypeInputType.FIXED && loading)}
                placeholder={loading ? getString('loading') : getString('pipelineSteps.serviceTab.selectService')}
                multiTypeInputProps={{
                  onTypeChange: setType,
                  width: 300,
                  expressions,
                  onChange: val => {
                    if (values.service?.identifier && (val as SelectOption).value !== values.service.identifier) {
                      setService(services?.filter(service => service.identifier !== values.service?.identifier))
                      setFieldValue('service', undefined)
                    }
                  },
                  selectProps: {
                    disabled: loading,
                    addClearBtn: true && !readonly,
                    items: selectOptions || []
                  }
                }}
                selectItems={selectOptions || []}
              />
              {type === MultiTypeInputType.FIXED ? (
                <Button
                  size={ButtonSize.SMALL}
                  variation={ButtonVariation.LINK}
                  disabled={readonly || (isEditService(values) ? !canEdit : !canCreate)}
                  onClick={() => {
                    const isEdit = isEditService(values)
                    if (isEdit) {
                      if (values.service?.identifier) {
                        setState({
                          isEdit,
                          formik,
                          isService: true,
                          data: values.service
                        })
                      } else {
                        setState({
                          isEdit,
                          formik,
                          isService: false,
                          data: services?.find(service => service.identifier === values.serviceRef)
                        })
                      }
                    } else {
                      setState({
                        isEdit: false,
                        formik,
                        isService: false
                      })
                    }
                    showModal()
                  }}
                  text={
                    isEditService(values) ? getString('editService') : getString('pipelineSteps.serviceTab.newService')
                  }
                />
              ) : null}
            </Layout.Horizontal>
          )
        }}
      </Formik>
    </>
  )
}

const DeployServiceInputStep: React.FC<DeployServiceProps & { formik?: any }> = ({
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

  const { showError, clear } = useToaster()
  const { expressions } = useVariablesExpression()
  const {
    data: serviceResponse,
    error,
    refetch
  } = useGetServiceAccessList({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })
  const [services, setService] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (serviceResponse?.data?.length) {
      setService(
        serviceResponse.data.map(service => ({
          label: service.service?.name || '',
          value: service.service?.identifier || ''
        }))
      )
    }
  }, [serviceResponse, serviceResponse?.data?.length])

  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.SERVICE,
      resourceIdentifier: services[0]?.value as string
    },
    permissions: [PermissionIdentifier.EDIT_SERVICE],
    options: {
      skipCondition: ({ resourceIdentifier }) => !resourceIdentifier
    }
  })

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.SERVICE
    },
    permissions: [PermissionIdentifier.EDIT_SERVICE]
  })
  const [state, setState] = React.useState<DeployServiceState>({ isEdit: false, isService: false })

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={onClose}
        title={state.isEdit ? getString('editService') : getString('newService')}
        isCloseButtonShown
        className={'padded-dialog'}
      >
        <NewEditServiceModal
          data={state.data || { name: '', identifier: '', orgIdentifier, projectIdentifier }}
          isEdit={state.isEdit}
          isService={state.isService}
          onCreateOrUpdate={values => {
            refetch()
            formik?.setFieldValue(
              `${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}serviceRef`,
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
    setState({ isEdit: false, isService: false })
    hideModal()
  }, [hideModal])
  if (error?.message) {
    clear()
    showError(error.message, undefined, 'cd.svc.list.error')
  }
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.serviceRef) === MultiTypeInputType.RUNTIME && (
        <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
          <FormInput.MultiTypeInput
            tooltipProps={{ dataTooltipId: 'specifyYourService' }}
            label={getString('pipelineSteps.serviceTab.specifyYourService')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}serviceRef`}
            placeholder={getString('pipelineSteps.serviceTab.selectService')}
            selectItems={services}
            useValue
            multiTypeInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              selectProps: {
                addClearBtn: true && !inputSetData?.readonly,
                items: services
              }
            }}
            disabled={inputSetData?.readonly}
            className={css.inputWidth}
          />
          {getMultiTypeFromValue(initialValues?.serviceRef) === MultiTypeInputType.FIXED && (
            <Button
              size={ButtonSize.SMALL}
              variation={ButtonVariation.LINK}
              disabled={inputSetData?.readonly || (isEditService(initialValues) ? !canEdit : !canCreate)}
              onClick={() => {
                const isEdit = isEditService(initialValues)
                if (isEdit) {
                  setState({
                    isEdit,
                    isService: false,
                    data: serviceResponse?.data?.filter(
                      service => service.service?.identifier === initialValues.serviceRef
                    )?.[0]?.service as ServiceRequestDTO
                  })
                }
                showModal()
              }}
              text={
                isEditService(initialValues)
                  ? getString('editService')
                  : getString('pipelineSteps.serviceTab.newService')
              }
            />
          )}
        </Layout.Horizontal>
      )}
    </>
  )
}

const DeployServiceInputStepFormik = connect(DeployServiceInputStep)
const ServiceRegex = /^.+stage\.spec\.serviceConfig\.serviceRef$/
export class DeployServiceStep extends Step<DeployServiceData> {
  lastFetched: number
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()
  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(ServiceRegex, this.getServiceListForYaml.bind(this))
  }

  protected getServiceListForYaml(
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
      const obj = get(pipelineObj, path.replace('.spec.serviceConfig.serviceRef', ''))
      if (obj.type === 'Deployment') {
        return getServiceListPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier
          }
        }).then(response => {
          const data =
            response?.data?.content?.map(service => ({
              label: service.service?.name || '',
              insertText: service.service?.identifier || '',
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
  renderStep(props: StepProps<DeployServiceData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, readonly = false } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <DeployServiceInputStepFormik
          initialValues={initialValues}
          readonly={readonly}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    }
    return (
      <DeployServiceWidget
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
  }: ValidateInputSetProps<DeployServiceData>): FormikErrors<DeployServiceData> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm
    if (
      isEmpty(data?.serviceRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.serviceRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.serviceRef = getString?.('pipelineSteps.serviceTab.serviceIsRequired')
    }
    return errors
  }
  protected stepPaletteVisible = false
  protected type = StepType.DeployService
  protected stepName = 'Deploy Service'
  protected stepIcon: IconName = 'service'

  protected defaultValues: DeployServiceData = {}
}
