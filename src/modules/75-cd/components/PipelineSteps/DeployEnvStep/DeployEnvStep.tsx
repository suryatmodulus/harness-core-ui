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
  CardSelect
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { get, isEmpty, isNull, noop, omit, omitBy, pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Classes, Dialog, FormGroup, Intent } from '@blueprintjs/core'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { FormikErrors } from 'formik'
import {
  PipelineInfrastructure,
  useGetEnvironmentListForProject,
  EnvironmentYaml,
  getEnvironmentListForProjectPromise
} from 'services/cd-ng'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { Step, StepProps, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { errorCheck } from '@common/utils/formikHelpers'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'

import { IdentifierValidation } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './DeployEnvStep.module.scss'

const logger = loggerFor(ModuleName.CD)
export interface DeployEnvData extends Omit<PipelineInfrastructure, 'environmentRef'> {
  environmentRef?: string
}

interface NewEditEnvironmentModalProps {
  isEdit: boolean
  data: EnvironmentYaml
  envIdentifier?: string
  onCreateOrUpdate(data: EnvironmentYaml): void
}

export const NewEditEnvironmentModal: React.FC<NewEditEnvironmentModalProps> = ({
  isEdit,
  data,
  onCreateOrUpdate
}): JSX.Element => {
  const { getString } = useStrings()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const typeList: { text: string; value: EnvironmentYaml['type'] }[] = [
    {
      text: getString('production'),
      value: 'Production'
    },
    {
      text: getString('nonProduction'),
      value: 'PreProduction'
    }
  ]
  return (
    <Layout.Vertical>
      <Formik<EnvironmentYaml>
        initialValues={data}
        formName="deployEnv"
        onSubmit={values => {
          onCreateOrUpdate(values)
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .trim()
            .required(getString?.('fieldRequired', { field: 'Environment' })),

          type: Yup.string().required(getString?.('fieldRequired', { field: 'Type' })),
          ...IdentifierValidation()
        })}
      >
        {formikProps => (
          <Layout.Vertical
            onKeyDown={e => {
              if (e.key === 'Enter') {
                formikProps.handleSubmit()
              }
            }}
            spacing="medium"
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
            <FormGroup
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
            <div>
              <Button
                data-id="environment-save"
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
  data: EnvironmentYaml
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
  const { data: environmentsResponse, error } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier }
  })

  const [environments, setEnvironments] = React.useState<SelectOption[]>([])
  const [state, setState] = React.useState<DeployEnvironmentState>({
    isEdit: false,
    data: { name: '', identifier: '', type: 'PreProduction' }
  })
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => {
          setState({ isEdit: false, data: { name: '', identifier: '', type: 'PreProduction' } })
          hideModal()
        }}
        isCloseButtonShown
        title={state.isEdit ? getString('editEnvironment') : getString('newEnvironment')}
        className={Classes.DIALOG}
      >
        <NewEditEnvironmentModal
          data={state.data}
          isEdit={state.isEdit}
          onCreateOrUpdate={values => {
            onUpdate?.({
              ...omit(initialValues, 'environmentRef'),
              environment: pick(omitBy(values, isNull), ['name', 'identifier', 'description', 'tags', 'type'])
            })
            const item = environments.filter(env => env.value === values.identifier)[0]
            if (item) {
              item.label = values.name || ''
              setEnvironments(environments)
            }
            setState({ isEdit: false, data: { name: '', identifier: '', type: 'PreProduction' } })
            hideModal()
          }}
        />
      </Dialog>
    ),
    [state.isEdit, state.data]
  )

  React.useEffect(() => {
    const identifier = initialValues.environment?.identifier
    const isExist = environments.filter(env => env.value === identifier).length > 0
    if (initialValues.environment && identifier && !isExist) {
      const value = { label: initialValues.environment.name || '', value: initialValues.environment.identifier || '' }
      environments.push(value)
      setEnvironments([...environments])
    }
  }, [initialValues.environment, initialValues.environment?.identifier, environments])

  React.useEffect(() => {
    if (environmentsResponse?.data?.content?.length) {
      setEnvironments(
        environmentsResponse.data.content.map(env => ({
          label: env.name || env.identifier || '',
          value: env.identifier || ''
        }))
      )
    }
  }, [environmentsResponse, environmentsResponse?.data?.content?.length, initialValues.environmentRef])

  if (error?.message) {
    showError(error.message)
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

  return (
    <>
      <Formik<DeployEnvData>
        onSubmit={noop}
        validate={values => {
          const selectedValue = ((values.environmentRef as unknown) as SelectOption).value as string
          if (selectedValue && !values.environment) {
            onUpdate?.({ ...omit(initialValues, 'environment'), environmentRef: selectedValue })
          } else {
            if (isEmpty(values.environmentRef)) {
              onUpdate?.({ ...omit(initialValues, 'environmentRef') })
            } else {
              onUpdate?.({ ...omit(initialValues, 'environment'), environmentRef: values.environmentRef })
            }
          }
        }}
        initialValues={{
          ...initialValues,
          ...(initialValues.environment && !isEmpty(initialValues.environment?.identifier)
            ? {
                environmentRef: {
                  label: initialValues.environment.name || '',
                  value: initialValues.environment.identifier || ''
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any
              }
            : initialValues.environmentRef &&
              getMultiTypeFromValue(initialValues.environmentRef) === MultiTypeInputType.FIXED
            ? {
                environmentRef: environments.filter(env => env.value === initialValues.environmentRef)[0]
              }
            : {})
        }}
        enableReinitialize
        validationSchema={Yup.object().shape({
          environmentRef: Yup.string().required(getString('pipelineSteps.environmentTab.environmentIsRequired'))
        })}
      >
        {({ values, setFieldValue }) => {
          return (
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <FormInput.MultiTypeInput
                label={getString('pipelineSteps.environmentTab.specifyYourEnvironment')}
                tooltipProps={{ dataTooltipId: 'specifyYourEnvironment' }}
                name="environmentRef"
                disabled={readonly}
                placeholder={getString('pipelineSteps.environmentTab.selectEnvironment')}
                multiTypeInputProps={{
                  width: 300,
                  onChange: value => {
                    if (isEmpty(value)) {
                      setFieldValue('environmentRef', '')
                    }
                    setFieldValue('environment', undefined)
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
                      if (values.environment) {
                        setState({
                          isEdit,
                          data: values.environment
                        })
                      } else {
                        setState({
                          isEdit,
                          data: ((environmentsResponse?.data?.content?.filter(
                            env => env.identifier === ((values.environmentRef as unknown) as SelectOption).value
                          )?.[0] as unknown) as EnvironmentYaml) || { name: '', identifier: '', type: 'PreProduction' }
                        })
                      }
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

const DeployEnvironmentInputStep: React.FC<DeployEnvironmentProps> = ({ inputSetData }) => {
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
  const { expressions } = useVariablesExpression()
  const { data: environmentsResponse, error, refetch } = useGetEnvironmentListForProject({
    queryParams: { accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })
  const [environments, setEnvironments] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (environmentsResponse?.data?.content?.length) {
      setEnvironments(
        environmentsResponse.data.content.map(env => ({
          label: env.name || env.identifier || '',
          value: env.identifier || ''
        }))
      )
    }
  }, [environmentsResponse, environmentsResponse?.data?.content?.length])

  if (error?.message) {
    showError(error.message)
  }
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.environmentRef) === MultiTypeInputType.RUNTIME && (
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
      )}
    </>
  )
}

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
        return getEnvironmentListForProjectPromise({
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
  renderStep(props: StepProps<DeployEnvData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, readonly = false } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <DeployEnvironmentInputStep
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
  validateInputSet(
    data: DeployEnvData,
    template: DeployEnvData,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<DeployEnvData> {
    const errors: FormikErrors<DeployEnvData> = {}
    if (
      isEmpty(data?.environmentRef) &&
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
