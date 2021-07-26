import type {
  StageElementConfig,
  ApprovalStageConfig,
  StageElementWrapperConfigConfig,
  DeploymentStageConfig,
  FeatureFlagStageConfig
} from 'services/cd-ng'
import type { IntegrationStageConfig, K8sDirectInfraYaml, UseFromStageInfraYaml } from 'services/ci'

export type AllStageConfig =
  | ApprovalStageConfig
  | DeploymentStageConfig
  | FeatureFlagStageConfig
  | IntegrationStageConfig

export interface ApprovalStageElementConfig extends StageElementConfig {
  spec?: ApprovalStageConfig
}

export interface DeploymentStageElementConfig extends StageElementConfig {
  spec?: DeploymentStageConfig
}

export interface FeatureFlagStageElementConfig extends StageElementConfig {
  spec?: FeatureFlagStageConfig
  environment?: string
  featureType?: string
  featureFlag?: string
}

export interface BuildStageElementConfig extends StageElementConfig {
  spec?: IntegrationStageConfig & {
    infrastructure: K8sDirectInfraYaml | UseFromStageInfraYaml
  }
}

export interface PipelineStageWrapper<T extends StageElementConfig = StageElementConfig> {
  stage?: StageElementWrapper<T>
  parent?: StageElementWrapperConfigConfig
}

export interface StageElementWrapper<T extends StageElementConfig = StageElementConfig>
  extends StageElementWrapperConfigConfig {
  stage?: T
}
