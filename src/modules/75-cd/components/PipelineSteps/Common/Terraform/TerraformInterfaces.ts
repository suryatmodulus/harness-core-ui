import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  ListType,
  MapType,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeMapType,
  MultiTypeMapUIType,
  SelectOption
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

import type { StepElementConfig } from 'services/cd-ng'
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
              connectorRef?: string | Connector
            }
          }
        }
        varFiles?: VarFileArray[]
      }
    }
    backendConfig?: BackendConfig
    targets?: MultiTypeListType
    environmentVariables?: MultiTypeMapType
  }
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
      }
    }
    backendConfig?: BackendConfig
    targets?: MultiTypeListType
    environmentVariables?: MultiTypeMapType
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

export const onSubmitTerraformData = (values: TerraformData): TerraformFormData => {
  if (values?.spec?.configuration?.type === 'Inline') {
    const envVars = values.spec?.environmentVariables as MultiTypeMapUIType
    const envMap: MapType = {}
    if (Array.isArray(envVars)) {
      envVars.forEach(mapValue => {
        if (mapValue.key) {
          envMap[mapValue.key] = mapValue.value
        }
      })
    }

    const targets = values?.spec?.targets as MultiTypeListUIType
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
        configuration: {
          ...values?.spec?.configuration,
          spec: {
            ...values.spec?.configuration.spec,
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
        },
        environmentVariables: envMap,
        targets: targetMap
      }
    }
  }

  return {
    ...values,
    spec: {
      provisionerIdentifier: values?.spec?.provisionerIdentifier
    }
  }
}
