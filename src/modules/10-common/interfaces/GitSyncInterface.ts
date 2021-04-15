import type { GitSyncEntityDTO } from 'services/cd-ng'

export interface Entity {
  [key: string]: GitSyncEntityDTO['entityType']
}

export const Entities: Entity = {
  APPROVAL_STAGE: 'ApprovalStage',
  CONNECTORS: 'Connectors',
  CV_CONFIG: 'CvConfig',
  CV_JOB: 'CvVerificationJob',
  CV_K8_ACTIVITY_SOURCE: 'CvKubernetesActivitySource',
  DELEGATES: 'Delegates',
  DELEGATE_CONFIGURATIONS: 'DelegateConfigurations',
  DEPLOYMENT_STAGE: 'DeploymentStage',
  DEPLOYMENT_STEPS: 'DeploymentSteps',
  ENVIRONMENT: 'Environment',
  INPUT_SETS: 'InputSets',
  INTEGRATION_STAGE: 'IntegrationStage',
  INTEGRATION_STEPS: 'IntegrationSteps',
  PIPELINES: 'Pipelines',
  PIPELINES_STEPS: 'PipelineSteps',
  PROJECTS: 'Projects',
  SECRETS: 'Secrets',
  SERVICE: 'Service'
}
