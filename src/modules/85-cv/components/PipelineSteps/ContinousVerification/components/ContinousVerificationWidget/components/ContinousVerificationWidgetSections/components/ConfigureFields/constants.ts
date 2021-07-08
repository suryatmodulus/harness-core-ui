export const defaultDeploymentTag = '<+serviceConfig.artifacts.primary.tag>'

export enum VerificationTypes {
  Test = 'Test',
  Bluegreen = 'Bluegreen',
  Canary = 'Canary',
  Rolling = 'Rolling',
  Health = 'Health'
}
