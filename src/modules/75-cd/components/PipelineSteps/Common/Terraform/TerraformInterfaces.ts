import type { Scope } from '@common/interfaces/SecretsInterface'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  ListType,
  MapType,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeMapType,
  MultiTypeMapUIType
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
  type?: string
  store?: {
    spec?: {
      gitFetchType?: string
      branch?: string
      commitId?: string
      connectorRef?: {
        label: string
        scope: Scope
        value: string
      }
      paths?: PathInterface[]
      content?: string
    }
  }
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
              connectorRef?: {
                label: string
                scope: Scope
                value: string
              }
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

export const onSubmitTerraformData = (values: TerraformData) => {
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
    return {
      ...values,
      spec: {
        ...values.spec,
        environmentVariables: envMap,
        targets: targetMap
      }
    }
  }

  return {
    ...values,
    spec: {
      ...values.spec
    }
  }
}
