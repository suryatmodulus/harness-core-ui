export const versions = [
  {
    commitHash: '46fa174',
    commitMssg: 'Added new feature flag for front-end use',
    commitedAt: 1619131189333,
    author: 'John Doe',
    authorAvatarUrl: '',
    isLatest: true
  },
  {
    commitHash: '56ea175',
    commitMssg: 'Added backend changes',
    commitedAt: 1619131159333,
    author: 'Foo Bar',
    authorAvatarUrl: '',
    isLatest: false
  }
]

export const branches = [
  {
    name: 'master'
  },
  {
    name: 'dev'
  },
  {
    name: 'release_omega_delta_sputnik_tango_charlie_rocket_v0.9'
  }
]

export const originalContent =
  'inputSet:\r\n    name: Rohan-demo-ethan\r\n    tags: {}\r\n    identifier: Rohandemoethan\r\n    description: ""\r\n    pipeline:\r\n        identifier: CD_Pipeline\r\n        stages:\r\n            - stage:\r\n                  identifier: Dev\r\n                  type: Deployment\r\n                  spec:\r\n                      serviceConfig:\r\n                          serviceDefinition:\r\n                              type: Kubernetes\r\n                              spec:\r\n                                  artifacts:\r\n                                      primary:\r\n                                          type: Dockerhub\r\n                                          spec:\r\n                                              tag: stable-perl\r\n                      infrastructure:\r\n                          infrastructureDefinition:\r\n                              type: KubernetesDirect\r\n                              spec:\r\n                                  namespace: rohan-dev'
export const modifiedContent =
  'inputSet:\r\n    name: Rohan-demo-ethan-temp\r\n    tags: {}\r\n    identifier: Rohandemoethan-temp\r\n    description: "Added temp desc"\r\n    pipeline:\r\n        identifier: CD_Pipeline\r\n        stages:\r\n            - stage:\r\n                  identifier: PROD\r\n                  type: Deployment\r\n                  spec:\r\n                      serviceConfig:\r\n                          serviceDefinition:\r\n                              type: Kubernetes\r\n                              spec:\r\n                                  artifacts:\r\n                                      primary:\r\n                                          type: Dockerhub\r\n                                          spec:\r\n                                              tag: stable-perl\r\n                      infrastructure:\r\n                          infrastructureDefinition:\r\n                              type: KubernetesDirect\r\n                              spec:\r\n                                  namespace: rohan-dev-temp'
