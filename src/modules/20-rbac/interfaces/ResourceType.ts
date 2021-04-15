export type ResourceGroup = Record<string, string>
export type ResourceGroupSelection = Record<string, boolean>
export enum ResourceType {
  ACCOUNT = 'ACCOUNT',
  ORGANIZATION = 'ORGANIZATION',
  PROJECT = 'PROJECT',
  SECRET = 'SECRET',
  CONNECTOR = 'CONNECTOR',
  PIPELINE = 'PIPELINE',
  SERVICE = 'SERVICE',
  ENVIRONMENT = 'ENVIRONMENT'
}

export enum ResourceCategory {
  PROJECT_RESOURCES = 'PROJECT_RESOURCES',
  ADMINSTRATIVE_FUNCTIONS = 'ADMINSTRATIVE_FUNCTIONS'
}
