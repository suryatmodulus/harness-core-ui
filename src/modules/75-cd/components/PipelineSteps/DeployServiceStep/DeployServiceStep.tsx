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
  useModalHook
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { get, isEmpty, isNil, isNull, noop, omit, omitBy, pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Classes, Dialog } from '@blueprintjs/core'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { FormikErrors } from 'formik'
import {
  ServiceConfig,
  useGetServiceListForProject,
  ServiceYaml,
  getServiceListForProjectPromise
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { Step, StepProps, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'

import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { NameIdDescriptionTags } from '@common/components'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './DeployServiceStep.module.scss'

const logger = loggerFor(ModuleName.CD)
export interface DeployServiceData extends Omit<ServiceConfig, 'serviceRef'> {
  serviceRef?: string
}

interface NewEditServiceModalProps {
  isEdit: boolean
  data: ServiceYaml
  serviceIdentifier?: string
  onCreateOrUpdate(data: ServiceYaml): void
}

export const NewEditServiceModal: React.FC<NewEditServiceModalProps> = ({
  isEdit,
  data,
  onCreateOrUpdate
}): JSX.Element => {
  const { getString } = useStrings()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  return (
    <Layout.Vertical>
      <Formik<ServiceYaml>
        initialValues={data}
        formName="deployService"
        onSubmit={values => {
          onCreateOrUpdate(values)
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .trim()
            .required(getString?.('fieldRequired', { field: 'Service' })),
          ...IdentifierValidation()
        })}
      >
        {formikProps => (
          <Layout.Vertical
            spacing="medium"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                formikProps.handleSubmit()
              }
            }}
            padding={{ top: 'xlarge', left: 'xlarge', right: 'xlarge' }}
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
            <div>
              <Button
                data-id="service-save"
                onClick={() => formikProps.submitForm()}
                intent="primary"
                text={getString('save')}
              />
            </div>
          </Layout.Vertical>
        )}
      </Formik>
    </Layout.Vertical>
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
  data: ServiceYaml
}

function isEditService(data: DeployServiceData): boolean {
  if (getMultiTypeFromValue(data.serviceRef) !== MultiTypeInputType.RUNTIME && !isEmpty(data.serviceRef)) {
    return true
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
  const { data: serviceResponse, error } = useGetServiceListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier }
  })

  const { expressions } = useVariablesExpression()

  const [services, setService] = React.useState<SelectOption[]>([])
  const [state, setState] = React.useState<DeployServiceState>({ isEdit: false, data: { name: '', identifier: '' } })
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => {
          setState({ isEdit: false, data: { name: '', identifier: '' } })
          hideModal()
        }}
        title={state.isEdit ? getString('editService') : getString('newService')}
        isCloseButtonShown
        className={Classes.DIALOG}
      >
        <NewEditServiceModal
          data={state.data}
          isEdit={state.isEdit}
          onCreateOrUpdate={values => {
            onUpdate?.({
              ...omit(initialValues, 'serviceRef'),
              service: pick(omitBy(values, isNull), ['name', 'identifier', 'description', 'tags'])
            })
            const item = services.filter(service => service.value === values.identifier)[0]
            if (item) {
              item.label = values.name || ''
              setService(services)
            }
            setState({ isEdit: false, data: { name: '', identifier: '' } })
            hideModal()
          }}
        />
      </Dialog>
    ),
    [state.isEdit, state.data]
  )

  React.useEffect(() => {
    const identifier = initialValues.service?.identifier
    const isExist = services.filter(service => service.value === identifier).length > 0
    if (initialValues.service && identifier && !isExist) {
      const value = { label: initialValues.service.name || '', value: initialValues.service.identifier || '' }
      services.push(value)
      setService([...services])
    }
  }, [initialValues.service, initialValues.service?.identifier, services])

  React.useEffect(() => {
    if (serviceResponse?.data?.content?.length && !isNil(initialValues.serviceRef)) {
      setService(
        serviceResponse.data.content.map(service => ({ label: service.name || '', value: service.identifier || '' }))
      )
    }
  }, [serviceResponse, serviceResponse?.data?.content?.length, initialValues.serviceRef])

  if (error?.message) {
    showError(error.message, undefined, 'cd.svc.list.error')
  }

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

  return (
    <>
      <Formik<DeployServiceData>
        onSubmit={noop}
        validate={values => {
          const selectedValue = ((values.serviceRef as unknown) as SelectOption).value as string
          if (selectedValue && !values.service) {
            onUpdate?.({ ...omit(initialValues, 'service'), serviceRef: selectedValue })
          } else {
            if (isEmpty(values.serviceRef)) {
              onUpdate?.({ ...omit(initialValues, 'serviceRef') })
            } else {
              onUpdate?.({ ...omit(initialValues, 'service'), serviceRef: values.serviceRef })
            }
          }
        }}
        initialValues={{
          ...initialValues,
          ...(initialValues.service && !isEmpty(initialValues.service?.identifier)
            ? {
                serviceRef: {
                  label: initialValues.service.name || '',
                  value: initialValues.service.identifier || ''
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any
              }
            : initialValues.serviceRef && getMultiTypeFromValue(initialValues.serviceRef) === MultiTypeInputType.FIXED
            ? {
                serviceRef: services.filter(service => service.value === initialValues.serviceRef)[0]
              }
            : {})
        }}
        enableReinitialize
        validationSchema={Yup.object().shape({
          serviceRef: Yup.string().required(getString('pipelineSteps.serviceTab.serviceIsRequired'))
        })}
      >
        {({ values, setFieldValue }) => {
          return (
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <FormInput.MultiTypeInput
                tooltipProps={{ dataTooltipId: 'specifyYourService' }}
                label={getString('pipelineSteps.serviceTab.specifyYourService')}
                name="serviceRef"
                disabled={readonly}
                placeholder={getString('pipelineSteps.serviceTab.selectService')}
                multiTypeInputProps={{
                  width: 300,
                  onChange: value => {
                    if (isEmpty(value)) {
                      setFieldValue('serviceRef', '')
                    }
                    setFieldValue('service', undefined)
                  },
                  expressions,
                  selectProps: {
                    addClearBtn: true && !readonly,
                    items: services
                  }
                }}
                selectItems={services}
              />
              {getMultiTypeFromValue(values?.serviceRef) === MultiTypeInputType.FIXED && (
                <Button
                  minimal
                  intent="primary"
                  disabled={readonly || (isEditService(values) ? !canEdit : !canCreate)}
                  onClick={() => {
                    const isEdit = isEditService(values)
                    if (isEdit) {
                      if (values.service) {
                        setState({
                          isEdit,
                          data: values.service
                        })
                      } else {
                        setState({
                          isEdit,
                          data: ((serviceResponse?.data?.content?.filter(
                            service => service.identifier === ((values.serviceRef as unknown) as SelectOption).value
                          )?.[0] as unknown) as ServiceYaml) || { name: '', identifier: '' }
                        })
                      }
                    }
                    showModal()
                  }}
                  text={
                    isEditService(values) ? getString('editService') : getString('pipelineSteps.serviceTab.newService')
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

const DeployServiceInputStep: React.FC<DeployServiceProps> = ({ inputSetData }) => {
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
  const { data: serviceResponse, error, refetch } = useGetServiceListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })
  const [services, setService] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (serviceResponse?.data?.content?.length) {
      setService(
        serviceResponse.data.content.map(service => ({ label: service.name || '', value: service.identifier || '' }))
      )
    }
  }, [serviceResponse, serviceResponse?.data?.content?.length])

  if (error?.message) {
    clear()
    showError(error.message, undefined, 'cd.svc.list.error')
  }
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.serviceRef) === MultiTypeInputType.RUNTIME && (
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
      )}
    </>
  )
}
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
        return getServiceListForProjectPromise({
          queryParams: {
            accountId,
            orgIdentifier,
            projectIdentifier
          }
        }).then(response => {
          const data =
            response?.data?.content?.map(service => ({
              label: service.name || '',
              insertText: service.identifier || '',
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
        <DeployServiceInputStep
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
  validateInputSet(
    data: DeployServiceData,
    template: DeployServiceData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<DeployServiceData> {
    const errors = {} as any
    if (isEmpty(data?.serviceRef) && getMultiTypeFromValue(template?.serviceRef) === MultiTypeInputType.RUNTIME) {
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
