export enum PageNames {
  Purpose = 'Purpose page',
  TrialInProgress = 'Trial in progress page',
  TrialSetupPipelineModal = 'Trial setup pipeline modal'
}

export enum PurposeActions {
  ModuleContinue = 'Purpose Continue click',
  CDModuleContinue = 'CD Welcome Page Continue Clicked',
  CDCGModuleSelected = 'CD Current Gen Continue Clicked'
}

export enum TrialActions {
  StartTrialClick = 'Start a trial click',
  TrialModalPipelineSetupSubmit = 'Trial modal pipeline setup submit',
  TrialModalPipelineSetupCancel = 'Trial modal pipeline setup cancel'
}

export enum PlanActions {
  StartFreeClick = 'Start a free plan click'
}

export enum StageActions {
  SelectStage = 'Select a Stage',
  SetupStage = 'Setup Stage',
  DeleteStage = 'Delete Stage'
}

export enum StepActions {
  SelectStep = 'Select a Step',
  AddEditStep = 'Add/Edit Step',
  AddEditStepGroup = 'Add/Edit Step Group',
  DeleteStep = 'Delete Step',
  AddEditFailureStrategy = 'Add/Edit Failure strategy'
}

export enum PipelineActions {
  StartedExecution = 'Started Pipeline Execution',
  // CompletedExecution = 'Completed Pipeline Execution', // this is done from BE
  StartedPipelineCreation = 'Started Pipeline Creation',
  PipelineCreatedViaVisual = 'Save a pipeline using Visual Mode',
  PipelineCreatedViaYAML = 'Save a pipeline using YAML editor',
  PipelineUpdatedViaVisual = 'Update a pipeline using Visual Mode',
  PipelineUpdatedViaYAML = 'Update a pipeline using YAML editor'
}

export enum NavigatedToPage {
  DeploymentsPage = 'Navigates to Deployments/Builds page',
  PipelinesPage = 'Navigates to Pipelines page',
  PipelineStudio = 'Navigates to Pipline Studio',
  PipelineInputSet = 'Navigates to Pipline Input Set',
  PipelineTriggers = 'Navigates to Pipline Triggers',
  PipelineExecutionHistory = 'Navigates to Pipline Execution History'
}

export enum Category {
  SIGNUP = 'SIGNUP'
}

export enum ManifestActions {
  SaveManifestOnPipelinePage = 'Save Manifest on Pipeline Page',
  UpdateManifestOnPipelinePage = 'Update Manifest on Pipeline Page'
}

export enum ArtifactActions {
  SavePrimaryArtifactOnPipelinePage = 'Save Primary Artifact on Pipeline Page',
  UpdatePrimaryArtifactOnPipelinePage = 'Update Primary Artifact on Pipeline Page',
  SaveSidecarArtifactOnPipelinePage = 'Save Sidecar Artifact on Pipeline Page',
  UpdateSidecarArtifactOnPipelinePage = 'Update Sidecar Artifact on Pipeline Page'
}
