import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  ListType,
  MultiTypeListType,
  MultiTypeMapType,
  SelectOption
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

import type {
  NGVariable,
  StepElementConfig,
  TerraformApplyStepInfo,
  TerraformBackendConfig,
  TerraformDestroyStepInfo,
  TerraformPlanStepInfo,
  TerraformVarFileWrapper
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export const TerraformStoreTypes = {
  Inline: 'Inline',
  Remote: 'Remote'
}
export interface TerraformProps {
  initialValues: TerraformData
  onUpdate?: (data: TerraformData) => void
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: TerraformData
    path?: string
  }
  readonly?: boolean
  stepType?: string
}

export interface TerraformPlanProps {
  initialValues: TFPlanFormData
  onUpdate?: (data: TFPlanFormData) => void
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: TFPlanFormData
    path?: string
  }
  readonly?: boolean
  stepType?: string
}

export interface TerraformPlanVariableStepProps {
  initialValues: TFPlanFormData
  originalData: TFPlanFormData
  stageIdentifier: string
  onUpdate?(data: TFPlanFormData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TFPlanFormData
}

export interface TerraformVariableStepProps {
  initialValues: TerraformData
  originalData: TerraformData
  stageIdentifier: string
  onUpdate?(data: TerraformData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TerraformData
  stepType?: string
}

export const ConfigurationTypes = {
  Inline: 'Inline',
  InheritFromPlan: 'InheritFromPlan',
  InheritFromApply: 'InheritFromApply'
}

export const CommandTypes = {
  Apply: 'Apply',
  Destroy: 'Destroy'
}
export interface PathInterface {
  path: string
}

export interface EnvironmentVar {
  key: string
  value: string
}

export interface BackendConfig {
  type: string
  spec: {
    content?: string
  }
}
export interface VarFileArray {
  varFile: {
    type?: string
    store?: {
      spec?: {
        gitFetchType?: string
        branch?: string
        commitId?: string
        connectorRef?: {
          label: string
          value: string
          scope: Scope
          live: boolean
          connector: { type: string; spec: { val: string } }
        }
        paths?: PathInterface[]
        content?: string
      }
    }
  }
}
export interface Connector {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: { type: string; spec: { val: string; url: string; connectionType?: string; type?: string } }
}
export interface TerraformData extends StepElementConfig {
  spec?: {
    provisionerIdentifier?: string
    configuration?: {
      type?: 'Inline' | 'InheritFromPlan' | 'InheritFromApply'

      spec?: TFDataSpec
    }
  }
}

export interface TerraformPlanData extends StepElementConfig {
  spec?: {
    provisionerIdentifier?: string
    configuration?: {
      command?: 'Apply' | 'Destroy'
      secretManagerRef?: string
    } & TFDataSpec
  }
}

export interface TFDataSpec {
  workspace?: string
  backendConfig?: TerraformBackendConfig
  targets?: any

  environmentVariables?: any
  configFiles?: {
    store?: {
      type?: string
      spec?: {
        gitFetchType?: string
        branch?: string
        commitId?: string
        folderPath?: string
        connectorRef?: string | Connector
      }
    }
  }
  varFiles?: TerraformVarFileWrapper[]
}

export interface TFFormData extends StepElementConfig {
  spec?: TerraformApplyStepInfo
}

export interface TFDestroyData extends StepElementConfig {
  spec?: TerraformDestroyStepInfo
}

export interface TFPlanFormData extends StepElementConfig {
  spec?: TerraformPlanStepInfo
}

export interface TerraformFormData extends StepElementConfig {
  delegateSelectors: string[]
  spec?: {
    provisionerIdentifier?: string
    configuration?: {
      type?: string
      spec?: {
        workspace?: string
        configFiles?: {
          store?: {
            type?: string
            spec?: {
              gitFetchType?: string
              branch?: string
              commitId?: string
              folderPath?: string
              connectorRef?: string
            }
          }
        }
        varFiles?: VarFileArray[]
        backendConfig?: BackendConfig
        targets?: MultiTypeListType
        environmentVariables?: MultiTypeMapType
      }
    }
  }
}

export interface TfVar {
  type?: string
  connectorRef?: {
    label: string
    scope: Scope
    value: string
  }
  gitFetchType?: string
  branch?: string
  commitId?: string
  paths?: string[]
}

export const onSubmitTerraformData = (values: any): TFFormData => {
  if (values?.spec?.configuration?.type === 'Inline') {
    const envVars = values.spec?.configuration?.spec?.environmentVariables
    const envMap: NGVariable[] = []
    if (Array.isArray(envVars)) {
      envVars.forEach(mapValue => {
        envMap.push({ name: mapValue.key, description: mapValue.value })
      })
    }

    const targets = values?.spec?.configuration?.spec?.targets as MultiTypeInputType
    const targetMap: ListType = []
    if (Array.isArray(targets)) {
      targets.forEach(target => {
        if (target.value) {
          targetMap.push(target.value)
        }
      })
    }

    const connectorValue = values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef as any

    return {
      ...values,
      spec: {
        ...values.spec,
        provisionerIdentifier: values.spec?.provisionerIdentifier,
        configuration: {
          type: values?.spec?.configuration?.type,
          spec: {
            ...values.spec?.configuration.spec,
            environmentVariables: envMap,
            targets: targetMap,

            configFiles: {
              ...values.spec?.configuration?.spec?.configFiles,
              store: {
                ...values.spec?.configuration?.spec?.configFiles?.store,
                type: connectorValue.connector?.type,
                spec: {
                  ...values.spec?.configuration?.spec?.configFiles?.store?.spec,
                  connectorRef: values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
                    ? getMultiTypeFromValue(
                        values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
                      ) === MultiTypeInputType.RUNTIME
                      ? values?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
                      : connectorValue.value
                    : ''
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    ...values,
    spec: {
      provisionerIdentifier: values?.spec?.provisionerIdentifier,
      configuration: {
        type: values?.spec?.configuration?.type
      }
    }
  }
}

export const onSubmitTFPlanData = (values: any): TFPlanFormData => {
  const envVars = values.spec?.configuration?.environmentVariables
  const envMap: NGVariable[] = []
  if (Array.isArray(envVars)) {
    envVars.forEach(mapValue => {
      envMap.push({ name: mapValue.key, description: mapValue.value })
    })
  }

  const targets = values?.spec?.configuration?.targets as MultiTypeInputType
  const targetMap: ListType = []
  if (Array.isArray(targets)) {
    targets.forEach(target => {
      if (target.value) {
        targetMap.push(target.value)
      }
    })
  }

  const connectorValue = values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef as any
  const secretManager = values?.spec?.configuration?.secretManagerRef as any

  return {
    ...values,
    spec: {
      ...values.spec,

      configuration: {
        ...values?.spec?.configuration,
        command: values?.spec?.configuration?.command,

        environmentVariables: envMap,
        targets: targetMap,
        secretManagerRef: values?.spec?.configuration?.secretManagerRef
          ? getMultiTypeFromValue(values?.spec?.configuration?.secretManagerRef) === MultiTypeInputType.RUNTIME
            ? values?.spec?.configuration?.secretManagerRef
            : secretManager.value
          : '',
        configFiles: {
          ...values.spec?.configuration?.configFiles,
          store: {
            ...values.spec?.configuration?.configFiles?.store,
            type: connectorValue.connector?.type,
            spec: {
              ...values.spec?.configuration?.configFiles?.store?.spec,
              connectorRef: values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef
                ? getMultiTypeFromValue(values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef) ===
                  MultiTypeInputType.RUNTIME
                  ? values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef
                  : connectorValue.value
                : ''
            }
          }
        }
      }
    }
  }
}
