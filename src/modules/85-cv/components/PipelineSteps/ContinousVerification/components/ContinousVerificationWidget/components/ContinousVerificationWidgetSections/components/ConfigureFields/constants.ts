export const defaultDeploymentTag = '<+serviceConfig.artifacts.primary.tag>'

export enum VerificationTypes {
  LoadTest = 'LoadTest',
  Bluegreen = 'Bluegreen',
  Canary = 'Canary',
  Rolling = 'Rolling',
  Health = 'Health'
}
